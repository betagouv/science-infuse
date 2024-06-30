import os
import uuid
from abc import ABC, abstractmethod
from typing import List, Tuple
from weaviate import WeaviateClient
from app.schemas import Document, DocumentChunk

class BaseDocumentProcessor(ABC):
    def __init__(self, client: WeaviateClient):
        self.client = client
        self.base_download_folder = os.path.join(os.getcwd(), '..', 'documents')
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
    def extract_document(self) -> Tuple[Document, List[DocumentChunk]]:
        pass

    def save_document(self, document: Document, chunks: List[DocumentChunk]):
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

        # chunk_ids = []
        # for chunk in chunks:
        #     chunk_id = self.client.collections.get("DocumentChunk").data.insert(
        #         properties=chunk.model_dump()
        #     )
        #     chunk_ids.append(chunk_id)
        # print("CHUNK IDS", chunk_ids)        
        # document_id = self.client.collections.get("Document").data.insert(
        #     properties=document.model_dump(),
        #     references={"hasChunks": chunk_ids}
        # )
        
        # return document_id

    # def load_file(self, source, is_url=False):
    #     if is_url:
    #         response = requests.get(source)
    #         file_path = source.split("/")[-1]
    #         with open(file_path, 'wb') as file:
    #             file.write(response.content)
    #         return file_path
    #     else:
    #         return source
    
    # def save_file(self, file_path, original_public_path):
    #     with open(file_path, 'rb') as file:
    #         self.client.data_object.create(
    #             file.read(),
    #             file_name=file_path,
    #             mime_type="application/octet-stream",
    #             original_public_path=original_public_path
    #         )
