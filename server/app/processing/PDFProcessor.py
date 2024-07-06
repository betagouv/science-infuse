from pathlib import Path
import os
from typing import List
import fitz
import io
import re
from PIL import Image, ImageFile
from unstructured.partition.pdf import partition_pdf
from SIWeaviateClient import SIWeaviateClient
from schemas import BoundingBox, Document, DocumentWithChunks, PdfImageChunk, PdfImageMetadata, PdfTextChunk, PdfTextMetadata, VideoTranscriptChunk, VideoTranscriptMetadata
from processing.text.SISurya import SISurya
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator
from processing.BaseDocumentProcessor import BaseDocumentProcessor
import shutil
import logging
from pymupdf import Document as PdfDocument
# TODO: check if not causing problems: https://github.com/python-pillow/Pillow/issues/1510
ImageFile.LOAD_TRUNCATED_IMAGES = True
logger = logging.getLogger()

non_space_or_digit_pattern = re.compile(r'[^\s\d]')
class PDFProcessor(BaseDocumentProcessor):
    def __init__(self, client, image_descriptor: SIImageDescription, translator: SITranslator, surya: SISurya, pdf_path: str):
        self.pdf_path = pdf_path
        print("PDFProcessor pdf_path", pdf_path, flush=True)
        self.image_descriptor = image_descriptor
        self.translator = translator
        self.surya = surya
        
        super().__init__(client)

    def save_pdf(self, pdf_path):
        output_folder = os.path.join(self.base_download_folder, 'pdf')
        os.makedirs(output_folder, exist_ok=True)
        filename = f"{self.id}.pdf"
        pdf_destination_path = os.path.join(output_folder, filename)
        # save the pdf locally
        shutil.copyfile(pdf_path, pdf_destination_path)
        return pdf_destination_path
    
    def unstructured_coordinates_to_bbox(self, coordinates):
        if (not coordinates):
            return False
        x1 = min(coordinates, key=lambda x: x[0])[0]
        y1 = min(coordinates, key=lambda x: x[1])[1]
        x2 = max(coordinates, key=lambda x: x[0])[0]
        y2 = max(coordinates, key=lambda x: x[1])[1]

        return BoundingBox(x1=x1, y1=y1, x2=x2, y2=y2)
    
    def keep_image(self, width, height):
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

    def save_image(self, image: Image.Image):
        output_folder = os.path.join(self.base_download_folder, "pdf", "images")
        os.makedirs(output_folder, exist_ok=True)
        image_path = os.path.join(output_folder, f"{self.get_random_uuid()}.png")
        image.save(image_path, "PNG")
        image.close()
        return image_path

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
                if (label in self.surya.SUB_TITLES):
                    current_subtitle = text

                if (self.keep_text(text) is True and label in self.surya.TEXTS):
                    chunk = PdfTextChunk(
                        document=document,
                        text=text,
                        title=f"{current_title}{'>' + current_subtitle if current_subtitle else ''}",
                        metadata=PdfTextMetadata(
                            page_number=page_index,
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

    def get_pdf_images(self, doc: type[PdfDocument]):
        temp_images = []
        logger.info("GET PDF IMAGES logger")

        for page_num in range(len(doc)):
            page = doc[page_num]
            image_list = page.get_images(full=True)
            
            for img in image_list:
                
                xref = img[0]
                image_coordinates = page.get_image_bbox(img)
                # logging.info(image_coordinates)
                base_image = doc.extract_image(xref)
                width = base_image.get('width', 0)
                height = base_image.get('height', 0)
                if (self.keep_image(width, height)):
                    image_bytes = base_image["image"]
                    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                    # y = (image_coordinates.top_left.y + image_coordinates.bottom_left.y)/2
                    y = image_coordinates.top_left.y
                    temp_images.append({"image": image, "page_number": page_num+1, "y_coordinate": y, 'bbox': {
                        "x0": image_coordinates.x0, 
                        "y0": image_coordinates.y0, 
                        "x1": image_coordinates.x1, 
                        "y1": image_coordinates.y1, 
                    }})
                    
        return temp_images


    def extract_document(self):
        print("PDFProcessor extract_document self.pdf_path", self.pdf_path, flush=True)
        local_pdf_path = self.save_pdf(self.pdf_path)
        media_name =Path(self.pdf_path).stem

        document = Document(
            document_id=self.id,
            public_path=self.absolute_path_to_local(local_pdf_path),
            original_public_path=local_pdf_path,
            media_name=media_name,
        )

        with fitz.open(local_pdf_path) as fitz_doc:

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
            for img in images_with_descriptions:
                print(f"description_en : {img.get('description_en')}", flush=True)
                print(f"description_fr : {img.get('description_fr')}", flush=True)
                image_path = self.save_image(img.get('image'))
                img.get('image').close()

                chunk = PdfImageChunk(
                    text=img.get('description_fr'),
                    title="",
                    document=document,
                    metadata=PdfImageMetadata(
                        public_path=self.absolute_path_to_local(image_path),
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
            return document, chunks
