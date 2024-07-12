from SIWeaviateClient import SIWeaviateClient
from schemas import Document, WebsiteExperienceChunk, WebsiteExperienceMetadata

from playwright.sync_api import sync_playwright, Page, Playwright, Browser

import os
import uuid
from typing import List, Tuple
from weaviate import WeaviateClient
from processing.BaseDocumentProcessor import BaseDocumentProcessor

from tenacity import retry, stop_after_attempt, wait_exponential
import logging
import traceback

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CiteScienceRessourcesJunior(BaseDocumentProcessor):
    def __init__(self, client: WeaviateClient, title: str, url: str, description: str, type: str):
        self.title = title
        self.url = url
        self.description = description
        self.type = type
        super().__init__(client)

    def extract_document(self):
        document = Document(
            document_id=self.id,
            public_path=self.url,
            original_path=self.url,
            media_name=self.title,
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

