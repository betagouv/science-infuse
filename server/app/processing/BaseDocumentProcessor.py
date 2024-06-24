import os
from abc import ABC, abstractmethod
from typing import List
import requests
from weaviate import WeaviateClient
from app.schemas import DocumentChunk
import uuid
class BaseDocumentProcessor(ABC):
    def __init__(self, client: WeaviateClient):
        self.client = client
        self.chunks:List[DocumentChunk] = []
        self.base_download_folder = os.path.join(os.getcwd(), '..', 'documents')
        self.id = str(uuid.uuid4())
        self.process_document()


    def process_document(self):
        self.chunks = self.extract_chunks()
        self.save_chunks(self.chunks)

    @abstractmethod
    def extract_chunks(self) -> List[DocumentChunk]:
        pass

    def save_chunks(self, chunks: List[DocumentChunk]):
        with self.client.collections.get("DocumentChunk").batch.dynamic() as batch:
            for chunk in chunks:
                batch.add_object(
                    properties=chunk.model_dump()
                )

    def load_file(self, source, is_url=False):
        if is_url:
            response = requests.get(source)
            file_path = source.split("/")[-1]
            with open(file_path, 'wb') as file:
                file.write(response.content)
            return file_path
        else:
            return source
    
    # def save_file(self, file_path, original_public_path):
    #     with open(file_path, 'rb') as file:
    #         self.client.data_object.create(
    #             file.read(),
    #             file_name=file_path,
    #             mime_type="application/octet-stream",
    #             original_public_path=original_public_path
    #         )
