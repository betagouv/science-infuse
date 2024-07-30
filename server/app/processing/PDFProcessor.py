from pathlib import Path
import os
from typing import List
import fitz
import io
import re
from PIL import Image, ImageFile
from unstructured.partition.pdf import partition_pdf
from SIWeaviateClient import SIWeaviateClient
from S3Storage import S3Storage
from schemas import BoundingBox, Document, DocumentWithChunks, PdfImageChunk, PdfImageMetadata, PdfTextChunk, PdfTextMetadata, VideoTranscriptChunk, VideoTranscriptMetadata
from processing.text.SISurya import SISurya
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator
from processing.BaseDocumentProcessor import BaseDocumentProcessor
import shutil
import logging
import numpy as np
from pymupdf import Document as PdfDocument
# TODO: check if not causing problems: https://github.com/python-pillow/Pillow/issues/1510
ImageFile.LOAD_TRUNCATED_IMAGES = True
logger = logging.getLogger()

non_space_or_digit_pattern = re.compile(r'[^\s\d]')
class PDFProcessor(BaseDocumentProcessor):
    def __init__(self, client, image_descriptor: SIImageDescription, translator: SITranslator, surya: SISurya, s3: S3Storage, pdf_path: str, remove_after_upload_to_s3: bool=True):
        self.pdf_path = pdf_path
        print("PDFProcessor pdf_path", pdf_path, flush=True)
        self.image_descriptor = image_descriptor
        self.translator = translator
        self.surya = surya
        self.s3 = s3
        self.remove_after_upload_to_s3 = remove_after_upload_to_s3
        
        super().__init__(client)

    def save_pdf_to_s3(self, pdf_path):
        filename = f"{self.id}.pdf"
        s3_object_name = os.path.join('pdf', filename)
        self.save_to_s3(self.s3, pdf_path, s3_object_name, remove=False)
        return s3_object_name
    
    def unstructured_coordinates_to_bbox(self, coordinates):
        if (not coordinates):
            return False
        x1 = min(coordinates, key=lambda x: x[0])[0]
        y1 = min(coordinates, key=lambda x: x[1])[1]
        x2 = max(coordinates, key=lambda x: x[0])[0]
        y2 = max(coordinates, key=lambda x: x[1])[1]

        return BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2)
    
    def is_single_color(self, image, tolerance=50):
        img_array = np.array(image)
        
        # Reshape the array to 2D (pixels, color channels)
        reshaped = img_array.reshape(-1, img_array.shape[-1])
        
        # Calculate the difference between each pixel and the first pixel
        diff = np.abs(reshaped - reshaped[0])
        
        # Check if all differences are within the tolerance
        return np.all(diff <= tolerance)

    def keep_image_based_on_size(self, width, height):
        aspect_ratio = width / height
        res_megapixel = (width * height) / 1_000_000

        if (res_megapixel < 0.05):
            return False

        # Check if aspect ratio is within an acceptable range
        min_aspect_ratio = 0.2
        max_aspect_ratio = 6
        if aspect_ratio < min_aspect_ratio or aspect_ratio > max_aspect_ratio:
            return False

        return True
    
    def keep_text(self, text:str):
        if (len(text) > 100):
            return True
        return False

    def is_not_only_space_and_number(self, string):
        return bool(non_space_or_digit_pattern.search(string))

    def get_image_from_page(self, doc, page):
        page = doc[page]
        dpi = 72
        zoom = dpi / 72  # 72 is the default DPI
        mat = fitz.Matrix(zoom, zoom)
        pix = page.get_pixmap(matrix=mat)
        img = Image.frombytes("RGB", [pix.width, pix.height], pix.samples)
        return img

    def get_pdf_text_chunks(self, fitz_document: type[PdfDocument], document: Document):
        images = [self.get_image_from_page(fitz_document, page_number) for page_number in range(len(fitz_document))]
        result_imgs, result_preds, result_labels = self.surya.process_images(images)
        current_title = ""
        current_subtitle = ""
        chunks: List[PdfTextChunk] = []
        for page_index in range(len(fitz_document)):
            page = fitz_document[page_index]
            preds = result_preds[page_index]
            labels = result_labels[page_index]
            img = result_imgs[page_index]
            # Sort bounding boxes by position
            sorted_indices = sorted(range(len(preds.bboxes)), key=lambda i: preds.bboxes[i].position)
            # Zip and iterate over sorted bounding boxes, labels, and indices
            for i in sorted_indices:
                box = preds.bboxes[i]
                label = labels[i]
                
                
                left, top, right, bottom = box.bbox
                # clean text
                text = self.surya.restructure_text(page.get_text("text", clip=box.bbox))
                if (label in self.surya.TITLES):
                    current_title = text
                    current_subtitle = ""
                if (label in self.surya.SUB_TITLES):
                    current_subtitle = text

                if (self.keep_text(text) is True and label in self.surya.TEXTS):
                    chunk = PdfTextChunk(
                        document=document,
                        text=text,
                        title=f"{current_title}{'>' + current_subtitle if current_subtitle else ''}",
                        metadata=PdfTextMetadata(
                            page_number=page_index+1,
                            bbox=BoundingBox(
                                x1=box.bbox[0], 
                                y1=box.bbox[1], 
                                x2=box.bbox[2], 
                                y2=box.bbox[3]
                            )
                        )
                    )
                    chunks.append(chunk)
                    
                    print("pos      :", box.position)
                    print("label    :", label)
                    print("cur_title:", current_title)
                    print("cur_subtitle:", current_subtitle)
                    print("text     :", text)
                    print("len text :", len(text))
                    print("\n===================\n")
                

        return chunks

    def save_image(self, image: Image.Image):
        output_folder = os.path.join(self.base_download_folder, "pdf", "images")
        os.makedirs(output_folder, exist_ok=True)
        file_name = f"{self.get_random_uuid()}.png"
        image_path = os.path.join(output_folder, file_name)
        image.save(image_path, "PNG")
        image.close()
        return image_path, file_name


    def get_pdf_images(self, doc: type[PdfDocument]):
        temp_images = []
        logger.info("GET PDF IMAGES logger")

        temp_images = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            
            for img_index, item in enumerate(doc.get_page_images(page_num)):
                try:
                    xref = item[0]
                    base_image = doc.extract_image(xref)
                    
                    if base_image:
                        image_bytes = base_image["image"]
                        image_ext = base_image["ext"]
                        pil_image = Image.open(io.BytesIO(image_bytes))

                        if pil_image.mode != "RGB":
                            pil_image = pil_image.convert("RGB")
                        
                        x0, y0, x1, y1 = page.get_image_bbox(item[7])
                        width = x1 - x0
                        height = y1 - y0
                        if (self.keep_image_based_on_size(width, height) and not self.is_single_color(pil_image)):
                            temp_images.append({
                                "image": pil_image,
                                "page_number": page_num + 1,
                                'bbox': {"x0": x0, "y0": y0, "x1": x1, "y1": y1},
                                'format': image_ext
                            })
                        
                
                except Exception as e:
                    print(f"Error processing image {img_index} on page {page_num}: {str(e)}")
                    continue
                                    
        return temp_images


    def extract_document(self):
        print("PDFProcessor extract_document self.pdf_path", self.pdf_path, flush=True)
        media_name =Path(self.pdf_path).stem


        pdf_s3_object_name = self.save_pdf_to_s3(self.pdf_path)

        document = Document(
            document_id=self.id,
            original_path=self.pdf_path,
            s3_object_name=pdf_s3_object_name,
            media_name=media_name,
        )

        with fitz.open(self.pdf_path) as fitz_doc:

            images = self.get_pdf_images(fitz_doc)
            print("PDFProcessor extract_document images", len(images), flush=True)
            text_chunks = self.get_pdf_text_chunks(fitz_doc, document)
            print("PDFProcessor extract_document texts", len(text_chunks), flush=True)
            images_chunks = [{**image, "description_en": self.image_descriptor.get_description(image['image'])} for image in images]
            # TODO for now deal with error in description ie ;Unsupported number of image dimensions: 2
            images_chunks = [chunk for chunk in images_chunks if chunk['description_en'] is not False]
            translated_images_descriptions = self.translator.en_to_fr_batch([image['description_en'] for image in images_chunks])
            images_with_descriptions = [
                {**image, "description_fr": translated_description}
                for image, translated_description in zip(images_chunks, translated_images_descriptions)
            ]
            
            chunks = []
            # create chunks for every images, and save them to s3
            for img in images_with_descriptions:
                image_path, file_name = self.save_image(img.get('image'))
                image_s3_object_name = f"{pdf_s3_object_name}/images/{file_name}"
                self.save_to_s3(self.s3, image_path, image_s3_object_name)
                img.get('image').close()

                chunk = PdfImageChunk(
                    text=img.get('description_fr'),
                    title="",
                    document=document,
                    metadata=PdfImageMetadata(
                        s3_object_name=image_s3_object_name,
                        page_number=img.get('page_number'),
                        bbox=BoundingBox(
                            x1=img.get('bbox',{}).get('x1', -1), 
                            y1=img.get('bbox',{}).get('x1', -1), 
                            x2=img.get('bbox',{}).get('x1', -1), 
                            y2=img.get('bbox',{}).get('x1', -1)
                        )
                    )
                )
                chunks.append(chunk)
            for text_chunk in text_chunks:
                chunks.append(text_chunk)
    
            if (self.remove_after_upload_to_s3 is True):
                os.remove(self.pdf_path)
    
            return document, chunks
