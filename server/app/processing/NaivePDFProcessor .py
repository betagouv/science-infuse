from pathlib import Path
import os
import fitz
import io
import re
from PIL import Image, ImageFile
from unstructured.partition.pdf import partition_pdf
from schemas import BoundingBox, Document, DocumentWithChunks, PdfImageChunk, PdfImageMetadata, PdfTextChunk, PdfTextMetadata, VideoTranscriptChunk, VideoTranscriptMetadata
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator
from processing.BaseDocumentProcessor import BaseDocumentProcessor
import shutil
import logging
# TODO: check if not causing problems: https://github.com/python-pillow/Pillow/issues/1510
ImageFile.LOAD_TRUNCATED_IMAGES = True
logger = logging.getLogger()

non_space_or_digit_pattern = re.compile(r'[^\s\d]')
class NaivePDFProcessor(BaseDocumentProcessor):
    def __init__(self, client, image_descriptor: SIImageDescription, translator: SITranslator, pdf_path: str):
        self.pdf_path = pdf_path
        print("PDFProcessor pdf_path", pdf_path, flush=True)
        self.image_descriptor = image_descriptor
        self.translator = translator
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
    
    def save_image(self, image: Image.Image):
        output_folder = os.path.join(self.base_download_folder, "pdf", "images")
        os.makedirs(output_folder, exist_ok=True)
        image_path = os.path.join(output_folder, f"{self.get_random_uuid()}.png")
        image.save(image_path, "PNG")
        image.close()
        return image_path

    def is_not_only_space_and_number(self, string):
        return bool(non_space_or_digit_pattern.search(string))

    def get_pdf_text_chunks(self, path: str):
        text_chunks = []
        with open(path, "rb") as pdf_file:
            print("start partition_pdf", flush=True)
            chunks = partition_pdf(
                file=pdf_file,
                languages=['fra'],
                ocr_languages=None,
                chunking_strategy="by_title",
                multipage_sections=True,
                max_characters=200000, # chunk into n chars 
                new_after_n_chars=18000, #cut off chunks after this many chars
                combine_text_under_n_chars=100,
            )
            print("end partition_pdf", len(chunk), flush=True)
            

            for chunk in chunks:
                char_count = 0
                y_points = [point[1] for subchunk in chunk.metadata.orig_elements for point in subchunk.metadata.coordinates.points]
                min_y = min(y_points)
                max_y = max(y_points)
                y = min_y
                
                coordinates = [self.unstructured_coordinates_to_bbox(subchunk.metadata.coordinates.points) for subchunk in chunk.metadata.orig_elements]
                bbox = BoundingBox(
                    x1=min(coordinates, key=lambda bbox: bbox.x1).x1,
                    y1=min(coordinates, key=lambda bbox: bbox.y1).y1,
                    x2=max(coordinates, key=lambda bbox: bbox.x2).x2,
                    y2=max(coordinates, key=lambda bbox: bbox.y2).y2
                )

                text_chunk = {"text": "", "pageNumber": chunk.metadata.pageNumber, "y_coordinate": y, "bbox": bbox}
                for subchunk in chunk.metadata.orig_elements:
                    if (self.is_not_only_space_and_number(subchunk.text)):
                        text_chunk["text"] += subchunk.text+"\n"

                text_chunks.append(text_chunk)

        return text_chunks

    def get_pdf_images(self, path: str):
        temp_images = []
        logger.info("GET PDF IMAGES logger")

        with fitz.open(path) as pdf_document:
            for page_num in range(len(pdf_document)):
                page = pdf_document[page_num]
                image_list = page.get_images(full=True)
                
                for img in image_list:
                    
                    xref = img[0]
                    image_coordinates = page.get_image_bbox(img)
                    # logging.info(image_coordinates)
                    base_image = pdf_document.extract_image(xref)
                    width = base_image.get('width', 0)
                    height = base_image.get('height', 0)
                    if (self.keep_image(width, height)):
                        image_bytes = base_image["image"]
                        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
                        # y = (image_coordinates.top_left.y + image_coordinates.bottom_left.y)/2
                        y = image_coordinates.top_left.y
                        temp_images.append({"image": image, "pageNumber": page_num+1, "y_coordinate": y, 'bbox': {
                            "x0": image_coordinates.x0, 
                            "y0": image_coordinates.y0, 
                            "x1": image_coordinates.x1, 
                            "y1": image_coordinates.y1, 
                        }})
                        
            return temp_images


    def extract_document(self):
        print("PDFProcessor extract_document self.pdf_path", self.pdf_path, flush=True)
        local_pdf_path = self.save_pdf(self.pdf_path)

        images = self.get_pdf_images(local_pdf_path)
        print("PDFProcessor extract_document images", len(images), flush=True)
        texts = self.get_pdf_text_chunks(local_pdf_path)
        print("PDFProcessor extract_document texts", len(texts), flush=True)
        images_chunks = [{**image, "description_en": self.image_descriptor.get_description(image['image'])} for image in images]
        # TODO for now deal with error in description ie ;Unsupported number of image dimensions: 2
        images_chunks = [chunk for chunk in images_chunks if chunk['description_en'] is not False]
        translated_images_descriptions = self.translator.en_to_fr_batch([image['description_en'] for image in images_chunks])
        images_with_descriptions = [
            {**image, "description_fr": translated_description}
            for image, translated_description in zip(images_chunks, translated_images_descriptions)
        ]
        
        
        mediaName =Path(self.pdf_path).stem

        document = Document(
            id=self.id,
            publicPath=self.absolute_path_to_local(local_pdf_path),
            originalPath=local_pdf_path,
            mediaName=mediaName,
        )
        chunks = []
        for img in images_with_descriptions:
            print(f"description_en : {img.get('description_en')}", flush=True)
            print(f"description_fr : {img.get('description_fr')}", flush=True)
            image_path = self.save_image(img.get('image'))
            img.get('image').close()

            chunk = PdfImageChunk(
                text=img.get('description_fr'),
                document=document,
                metadata=PdfImageMetadata(
                    publicPath=self.absolute_path_to_local(image_path),
                    pageNumber=img.get('pageNumber'),
                    bbox=BoundingBox(
                        x1=img.get('bbox',{}).get('x1', -1), 
                        y1=img.get('bbox',{}).get('x1', -1), 
                        x2=img.get('bbox',{}).get('x1', -1), 
                        y2=img.get('bbox',{}).get('x1', -1)
                    )
                )
            )
            chunks.append(chunk)
        for text in texts:
            chunk = PdfTextChunk(
                text=text.get('text'),
                document=document,
                metadata=PdfTextMetadata(
                    pageNumber=text.get('pageNumber'),
                    bbox=text.get('bbox')
                )
            )
            chunks.append(chunk)
            
        # logging.info(images_with_descriptions)
        
        return document, chunks



