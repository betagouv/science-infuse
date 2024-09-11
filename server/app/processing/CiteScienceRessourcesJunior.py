from schemas import Document, WebsiteExperienceChunk, WebsiteExperienceMetadata


from processing.BaseDocumentProcessor import BaseDocumentProcessor

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CiteScienceRessourcesJunior(BaseDocumentProcessor):
    def __init__(self, title: str, url: str, description: str, type: str):
        self.title = title
        self.url = url
        self.description = description
        self.type = type
        super().__init__()

    def extract_document(self):
        document = Document(
            id=self.id,
            publicPath=self.url,
            originalPath=self.url,
            mediaName=self.title,
        )
        chunk = WebsiteExperienceChunk(
            chunk_id=self.id,
            document=document,
            title=self.title,
            text=f"Ressource Junior\nTitre: {self.title}\nDescription: {self.description}",
            metadata=WebsiteExperienceMetadata(
                url=self.url,
                type=self.type,
                description=self.description,
                title=self.title,
            )
        )
        return document, [chunk]

