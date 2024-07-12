import os
import uuid
from abc import ABC, abstractmethod
from typing import List, Tuple
from weaviate import WeaviateClient
from S3Storage import S3Storage
from schemas import Document, DocumentWithChunks, DocumentChunk

class BaseDocumentProcessor(ABC):
    def __init__(self, client: WeaviateClient):
        self.client = client
        self.base_download_folder = os.path.join(os.getcwd(), 'documents')
        # self.base_download_folder = os.path.join(os.getcwd(), '..', 'documents')
        self.id = str(uuid.uuid4())
        # TODO UNCOMMENT
        self.process_document()

    def save_to_s3(self, s3: S3Storage, input_file_path: str, s3_object_name: str, remove=True):
        s3.upload_file(input_file_path, s3_object_name)
        if (remove is True):
            os.remove(input_file_path)
        return s3_object_name

    def get_random_uuid(self):
        return str(uuid.uuid4())
    
    def absolute_path_to_local(self, path_str: str):
        return path_str.replace(self.base_download_folder, "")
    
    def process_document(self):
        document, chunks = self.extract_document()
        self.save_document(document, chunks)

    @abstractmethod
    def extract_document(self) -> Tuple[Document, List[DocumentChunk]]:
        pass

    def temp_fix_metadata_not_filterable(self, chunk_dict):
        """
        cf: app/models.py #metadatas
        https://github.com/weaviate/weaviate/issues/3694
        """
        for key in chunk_dict['metadata']:
            chunk_dict[f"meta_{key}"] = chunk_dict['metadata'][key]
        del chunk_dict['metadata']
        return chunk_dict
    
    def save_document(self, document: DocumentWithChunks, chunks: List[DocumentChunk]):
        # self.client.collections.get("Document").data.insert(document.model_dump())

        documents = self.client.collections.get("Document")
        document_uuid = documents.data.insert(document.model_dump())

        # Create DocumentChunks and link to Document
        document_chunks = self.client.collections.get("DocumentChunk")
        for chunk in chunks:
            chunk_dict = self.temp_fix_metadata_not_filterable(chunk.model_dump())
            # chunk_dict = chunk.model_dump()
            chunk_uuid = document_chunks.data.insert(chunk_dict)
            
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