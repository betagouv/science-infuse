import os
import uuid
from abc import ABC, abstractmethod
from typing import List, Tuple
from weaviate import WeaviateClient
from schemas import DocumentWithChunks, DocumentChunk

class BaseDocumentProcessor(ABC):
    def __init__(self, client: WeaviateClient):
        self.client = client
        self.base_download_folder = os.path.join(os.getcwd(), 'documents')
        # self.base_download_folder = os.path.join(os.getcwd(), '..', 'documents')
        self.id = str(uuid.uuid4())
        # TODO UNCOMMENT
        self.process_document()

    def get_random_uuid(self):
        return str(uuid.uuid4())
    
    def absolute_path_to_local(self, path_str: str):
        return path_str.replace(self.base_download_folder, "")
    
    def process_document(self):
        document, chunks = self.extract_document()
        self.save_document(document, chunks)

    @abstractmethod
    def extract_document(self) -> Tuple[DocumentWithChunks, List[DocumentChunk]]:
        pass

    def save_document(self, document: DocumentWithChunks, chunks: List[DocumentChunk]):
        # self.client.collections.get("Document").data.insert(document.model_dump())

        documents = self.client.collections.get("Document")
        document_uuid = documents.data.insert(document.model_dump())

        # Create DocumentChunks and link to Document
        document_chunks = self.client.collections.get("DocumentChunk")
        for chunk in chunks:
            chunk_uuid = document_chunks.data.insert(chunk.model_dump())
            
            # Link chunk to document
            document_chunks.data.reference_add(
                from_uuid=chunk_uuid,
                from_property="belongsToDocument",
                to=document_uuid
            )
            
            # Link document to chunk
            documents.data.reference_add(
                from_uuid=document_uuid,
                from_property="hasChunks",
                to=chunk_uuid
            )

        return document_uuid