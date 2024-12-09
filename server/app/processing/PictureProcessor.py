from pathlib import Path
import os
import re
from PIL import Image, ImageFile
from S3Storage import S3Storage
from schemas import Document, ImageChunk, ImageMetadata
from processing.image.SIImageDescription import SIImageDescription
from processing.text.SIITranslator import SITranslator
from processing.BaseDocumentProcessor import BaseDocumentProcessor
import logging
import numpy as np
# TODO: check if not causing problems: https://github.com/python-pillow/Pillow/issues/1510
ImageFile.LOAD_TRUNCATED_IMAGES = True
logger = logging.getLogger()

non_space_or_digit_pattern = re.compile(r'[^\s\d]')
class PictureProcessor(BaseDocumentProcessor):
    def __init__(self, image_descriptor: SIImageDescription, translator: SITranslator, s3: S3Storage, picture_path: str, remove_after_upload_to_s3: bool=True):
        self.picture_path = picture_path
        print("PictureProcessor picture_path", picture_path, flush=True)
        self.image_descriptor = image_descriptor
        self.translator = translator
        self.s3 = s3
        self.remove_after_upload_to_s3 = remove_after_upload_to_s3
        
        return super().__init__()

    def save_picture_to_s3(self, picture_path):
        filename = f"{self.id}.png"
        s3ObjectName = os.path.join('picture', filename)
        self.save_to_s3(self.s3, picture_path, s3ObjectName, remove=False)
        return s3ObjectName
    
    def is_single_color(self, image, tolerance=50):
        img_array = np.array(image)
        
        # Reshape the array to 2D (pixels, color channels)
        reshaped = img_array.reshape(-1, img_array.shape[-1])
        
        # Calculate the difference between each pixel and the first pixel
        diff = np.abs(reshaped - reshaped[0])
        
        # Check if all differences are within the tolerance
        return np.all(diff <= tolerance)

    def extract_document(self):
        print("PictureProcessor extract_document self.picture_path", self.picture_path, flush=True)
        mediaName =Path(self.picture_path).stem


        picture_s3ObjectName = self.save_picture_to_s3(self.picture_path)

        document = Document(
            id=self.id,
            originalPath=self.picture_path,
            s3ObjectName=picture_s3ObjectName,
            mediaName=mediaName,
        )

        picture = Image.open(self.picture_path)
        picture_description_en = self.image_descriptor.get_description(picture)
        print("picture_description_en", picture_description_en)
        picture_description_fr = self.translator.en_to_fr(picture_description_en)
        
        chunk = ImageChunk(
            text=picture_description_fr,
            title="",
            document=document,
            metadata=ImageMetadata(
                s3ObjectName=picture_s3ObjectName,
            )
        )
        if (self.remove_after_upload_to_s3 is True):
            os.remove(self.picture_path)
        return document, [chunk]
