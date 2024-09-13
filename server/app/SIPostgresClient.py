import json
import os
import uuid
import psycopg2
from psycopg2.extensions import connection, cursor
from schemas import Document, DocumentChunk

class SIPostgresClient:
    def __init__(self):
        self.conn: connection = None
        self.cur: cursor = None

    def connect_with_env(self) -> connection:
        self.conn = psycopg2.connect(
            host=os.getenv("POSTGRES_HOST", "localhost"),
            database=os.getenv("POSTGRES_DB", "scienceinfuse"),
            user=os.getenv("POSTGRES_USER", "postgres"),
            password=os.getenv("POSTGRES_PASSWORD")
        )
        return self.conn

    def connect_with_params(self, host: str, database: str, user: str, password: str) -> connection:
        self.conn = psycopg2.connect(
            host=host,
            database=database,
            user=user,
            password=password
        )
        return self.conn

    def __enter__(self):
        self.conn = self.connect_with_env()
        self.cur = self.conn.cursor()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.cur:
            self.cur.close()
        if self.conn:
            self.conn.close()
        return False
    
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

    def commit(self):
        return self.conn.commit()

    # def execute_query(self, query: str, params=None):
    #     with self as cur:
    #         cur.execute(query, params)
    #         return cur.fetchall()

    # def execute_and_commit(self, query: str, params=None):
    #     with self as cur:
    #         cur.execute(query, params)
    #         self.commit()
