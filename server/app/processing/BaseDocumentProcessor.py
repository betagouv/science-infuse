import json
import os
import uuid
from abc import ABC, abstractmethod
from typing import List, Tuple

import psycopg2
from S3Storage import S3Storage
from router.embedding import get_embeddings
from schemas import Document, DocumentChunk


conn = psycopg2.connect(
    host="localhost",
    database="scienceinfuse", 
    user="postgres", 
    password=f"{os.environ['POSTGRES_PASSWORD']}"
)

cur = conn.cursor()

class BaseDocumentProcessor(ABC):
    def __init__(self):
        self.cur = cur
        self.conn = conn
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
    def insert_document(self, document_id, doc: Document):
        self.cur.execute("""
            INSERT INTO "Document" (id, "s3ObjectName", "originalPath", "publicPath", "mediaName")
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        """, (
            document_id, doc.s3ObjectName, doc.originalPath, doc.publicPath, doc.mediaName
        ))
        return self.cur.fetchone()[0]


    # Helper function to insert document chunk
    def insert_chunk(self, chunk: DocumentChunk, text_embedding, document_id):
        for field in ['text', 'title', 'media_type']:
            if field in chunk and '\x00' in chunk[field]:
                chunk[field] = chunk[field].replace('\x00', '')

        chunk_uuid = str(uuid.uuid4())
        self.cur.execute("""
            INSERT INTO "DocumentChunk" (id, "text", "textEmbedding", "title", "mediaType", "documentId")
            VALUES (%s, %s, %s, %s, %s, %s)
            RETURNING id
        """, (
            chunk_uuid, chunk.text, text_embedding, chunk.title, chunk.mediaType, document_id
        ))
        chunk_id = self.cur.fetchone()[0]
        meta_uuid = str(uuid.uuid4())
        metadata = chunk.metadata.model_dump()
        # Insert metadata
        self.cur.execute("""
            INSERT INTO "DocumentChunkMeta" (id, "documentChunkId", "s3ObjectName", "pageNumber", "bbox", "type", "start", "end", "question", "answer", "url", "description", "title")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            meta_uuid, 
            chunk_id, 
            metadata.get("s3ObjectName"), 
            metadata.get("pageNumber"),
            json.dumps(metadata.get("bbox")), 
            metadata.get("type"),
            metadata.get("start"), 
            metadata.get("end"),
            metadata.get("question"), 
            metadata.get("answer"), 
            metadata.get("url"),
            metadata.get("description"),
            metadata.get("title"),
        ))
        return

    def save_document(self, document: Document, chunks: List[DocumentChunk]):
        
        document_id = str(uuid.uuid4())
        print("INSERT DOCUMENT", document_id, document, flush=True)
        db_document = self.insert_document(document_id, document)
        
        print("INSERT CHUNKS", chunks, flush=True)
        for chunk in chunks:
            print("INSERT CHUNK - ", chunk, flush=True)
            vector = get_embeddings(chunk.text)
            self.insert_chunk(chunk, vector, document_id)
        self.conn.commit()
        
        print("SAVE DOCUMENT", document, chunks)

        return
        documents = self.client.collections.get("Document")
        document_id = documents.data.insert(document.model_dump())

        # Create DocumentChunks and link to Document
        document_chunks = self.client.collections.get("DocumentChunk")
        for chunk in chunks:
            chunk_dict = self.temp_fix_metadata_not_filterable(chunk.model_dump())
            # chunk_dict = chunk.model_dump()
            chunk_id = document_chunks.data.insert(chunk_dict)
            
            # Link chunk to document
            document_chunks.data.reference_add(
                from_uuid=chunk_id,
                from_property="belongsToDocument",
                to=document_id
            )
            
            # Link document to chunk
            documents.data.reference_add(
                from_uuid=document_id,
                from_property="hasChunks",
                to=chunk_id
            )

        return document_id