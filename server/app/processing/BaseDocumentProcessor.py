import json
import os
import uuid
from abc import ABC, abstractmethod
from typing import List, Tuple

from S3Storage import S3Storage
from SIPostgresClient import SIPostgresClient
from router.embedding import get_embeddings
from schemas import Document, DocumentChunk


class BaseDocumentProcessor(ABC):
    def __init__(self):
        self.base_download_folder = os.path.join(os.getcwd(), 'documents')
        self.id = str(uuid.uuid4())
        self.process_document()

    def save_to_s3(self, s3: S3Storage, input_file_path: str, s3ObjectName: str, remove=True):
        s3.upload_file(input_file_path, s3ObjectName)
        if (remove is True):
            os.remove(input_file_path)
        return s3ObjectName

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
        
        
    # Helper function to insert document

    def save_document(self, document: Document, chunks: List[DocumentChunk]):
        
        with SIPostgresClient() as client:
            document_id = str(uuid.uuid4())
            db_document = client.insert_document(document_id, document)
            for chunk in chunks:
                vector = get_embeddings(chunk.text)
                print("INSERT CHUNK - ", chunk.text, vector, flush=True)
                client.insert_chunk(chunk, vector, document_id)
            client.commit()