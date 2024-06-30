import os
import fitz
import io
import re
from PIL import Image, ImageFile
from unstructured.partition.pdf import partition_pdf
from app.SIWeaviateClient import SIWeaviateClient
from app.schemas import Document, ImageChunk, ImageMetadata, TextChunk, TextMetadata, VideoTranscriptChunk, VideoTranscriptMetadata
from app.processing.image.SIImageDescription import SIImageDescription
from app.processing.text.SIITranslator import SITranslator
from app.processing.BaseDocumentProcessor import BaseDocumentProcessor
import shutil
# TODO: check if not causing problems: https://github.com/python-pillow/Pillow/issues/1510
ImageFile.LOAD_TRUNCATED_IMAGES = True

non_space_or_digit_pattern = re.compile(r'[^\s\d]')
class PDFProcessor(BaseDocumentProcessor):
    def __init__(self, client, image_descriptor: SIImageDescription, translator: SITranslator, pdf_path: str):
        self.pdf_path = pdf_path
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
    
    def keep_image(self, width, height):
        aspect_ratio = width / height
        res_megapixel = (width * height) / 1000000

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
        return image_path

    def is_not_only_space_and_number(self, string):
        return bool(non_space_or_digit_pattern.search(string))

    def get_pdf_text_chunks(self, path: str):
        chunks = partition_pdf(
            filename=path,
            languages=['fra'],
            ocr_languages=None,
            chunking_strategy="by_title",
            multipage_sections=True,
            max_characters=200000, # chunk into n chars 
            new_after_n_chars=18000, #cut off chunks after this many chars
            combine_text_under_n_chars=100,
        )
        
        text_chunks = []

        for chunk in chunks:
            char_count = 0
            y_points = [point[1] for subchunk in chunk.metadata.orig_elements for point in subchunk.metadata.coordinates.points]
            min_y = min(y_points)
            max_y = max(y_points)
            y = min_y
            text_chunk = {"text": "", "page_number": chunk.metadata.page_number, "y_coordinate": y}
            for subchunk in chunk.metadata.orig_elements:
                if (self.is_not_only_space_and_number(subchunk.text)):
                    text_chunk["text"] += subchunk.text+"\n"

            text_chunks.append(text_chunk)

        return text_chunks

    def get_pdf_images(self, path: str):
        pdf_document = fitz.open(path)
        temp_images = []

        for page_num in range(len(pdf_document)):
            page = pdf_document[page_num]
            image_list = page.get_images(full=True)
            
            for img in image_list:
                
                xref = img[0]
                image_coordinates = page.get_image_bbox(img)
                # print(image_coordinates)
                base_image = pdf_document.extract_image(xref)
                width = base_image.get('width', 0)
                height = base_image.get('height', 0)
                if (self.keep_image(width, height)):
                    image_bytes = base_image["image"]
                    image = Image.open(io.BytesIO(image_bytes))
                    # y = (image_coordinates.top_left.y + image_coordinates.bottom_left.y)/2
                    y = image_coordinates.top_left.y
                    temp_images.append({"image": image, "page_number": page_num+1, "y_coordinate": y})
                    
        pdf_document.close()
        return temp_images


    def extract_document(self):
        local_pdf_path = self.save_pdf(self.pdf_path)
        images = self.get_pdf_images(local_pdf_path)
        texts = self.get_pdf_text_chunks(local_pdf_path)
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
            
            print(img.get('description_en'))
            print(img.get('description_fr'))
            print("============")
            image_path = self.save_image(img.get('image'))

            chunk = ImageChunk(
                text=img.get('description_fr'),
                metadata=ImageMetadata(
                    public_path=self.absolute_path_to_local(image_path),
                    page_number=img.get('page_number'),
                    width=img.get('image').width,
                    height=img.get('image').height,
                )
            )
            chunks.append(chunk)
        for text in texts:
            chunk = TextChunk(
                text=text.get('text'),
                metadata=TextMetadata(
                    text_start_offset=0,                    
                    text_end_offset=1,                    
                )
            )
            chunks.append(chunk)
            
        
        # print(images_with_descriptions)
        document = Document(
            chunks=chunks,
            document_id=self.id,
            local_path=local_pdf_path,
            original_public_path=local_pdf_path,
            media_name=local_pdf_path,
        )
        return document, chunks
