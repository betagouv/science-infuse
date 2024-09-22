import weaviate
import os
from weaviate.connect import ConnectionParams
from weaviate import WeaviateClient
class SIWeaviateClient:
    def __init__(self):
        self.client:WeaviateClient = None

    def connect_to_local(self) -> WeaviateClient:
        self.client = weaviate.connect_to_local()

    def connect_with_env(self) -> WeaviateClient:
        
        client = weaviate.WeaviateClient(
            connection_params=ConnectionParams.from_params(
                http_host=os.getenv("WEAVIATE_URL"),
                http_port=int(os.getenv("WEAVIATE_PORT")),
                http_secure=False,
                grpc_host=os.getenv("WEAVIATE_URL"),
                grpc_port=int(os.getenv("WEAVIATE_GRPC_PORT")),
                grpc_secure=False,
            ),
        )
        client.connect()
        return client
    def __enter__(self) -> WeaviateClient:
        # Change the connection function here
        # self.client = self.connect_to_local()
        self.client = self.connect_with_env()
        return self.client

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.client:
            self.client.close()
        return False

import sys
import os
import dotenv
from weaviate.classes.query import Filter, QueryReference

dotenv.load_dotenv('../.env')

# Add parent directory to Python path
sys.path.append(os.path.abspath(os.path.join(os.getcwd(), '..', 'server')))

import weaviate
import psycopg2
from psycopg2.extras import execute_batch
from pgvector.psycopg2 import register_vector
from tqdm import tqdm

import json
import os
import uuid

conn = psycopg2.connect(
    host="localhost",
    database="scienceinfuse", 
    user="postgres", 
    password=f"{os.environ['POSTGRES_PASSWORD']}"
)

cur = conn.cursor()
cur.execute("CREATE EXTENSION IF NOT EXISTS vector")
register_vector(cur)

# Helper function to insert document
def insert_document(document_uuid, doc):
    cur.execute("""
        INSERT INTO "Document" (id, "s3ObjectName", "originalPath", "publicPath", "mediaName")
        VALUES (%s, %s, %s, %s, %s)
        RETURNING id
    """, (
        document_uuid, doc['s3_object_name'], doc['original_path'], doc.get('public_path'), doc['media_name']
    ))
    return cur.fetchone()[0]


# Helper function to insert document chunk
def insert_chunk(chunk_uuid, chunk, text_embedding, document_uuid):
    for field in ['text', 'title', 'media_type']:
        if field in chunk and '\x00' in chunk[field]:
            chunk[field] = chunk[field].replace('\x00', '')
    # print(text_embedding)
    cur.execute("""
        INSERT INTO "DocumentChunk" (id, "text", "textEmbedding", "title", "mediaType", "documentId")
        VALUES (%s, %s, %s, %s, %s, %s)
        RETURNING id
    """, (
        chunk_uuid, chunk['text'], text_embedding, chunk['title'], chunk['media_type'], document_uuid
    ))
    chunk_id = cur.fetchone()[0]
    meta_uuid = str(uuid.uuid4())

    # Insert metadata
    cur.execute("""
        INSERT INTO "DocumentChunkMeta" (id, "documentChunkId", "s3ObjectName", "pageNumber", "bbox", "type", "start", "end", "question", "answer", "url", "description", "title")
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
    """, (
        meta_uuid, chunk_id, 
        chunk['meta_s3_object_name'], 
        chunk.get('meta_page_number'),
        json.dumps(chunk.get('meta_bbox')), 
        chunk.get('meta_type'),
        chunk.get('meta_start'), 
        chunk.get('meta_end'),
        chunk.get('meta_question'), 
        chunk.get('meta_answer'), 
        chunk.get('meta_url'),
        chunk.get('meta_description'),
        chunk.get('meta_title'),
    ))

import numpy as np


count = {}
with SIWeaviateClient() as client:
    # Migrate Documents
    document = client.collections.get("Document")
    documentChunk = client.collections.get("DocumentChunk")

    # INSERT DOCUMENT
    doc_count = 0
    for doc in tqdm(document.iterator(), desc="Migrating Documents"):
        document_uuid = str(doc.uuid)
        insert_document(document_uuid, doc.properties)
        doc_count += 1
        if doc_count % 1000 == 0:
            conn.commit()

    chunk_count = 0
    for chunk in tqdm(documentChunk.iterator(include_vector=True,return_references=[QueryReference(
            link_on="belongsToDocument",
            include_vector=True, 
        )]), desc="Migrating DocumentChunk"):
        chunk_uuid = str(chunk.uuid)
        chunk_properties = chunk.properties
        media_type = chunk_properties.get('media_type')
        chunk_vector = chunk.vector.get("default")
        if ("belongsToDocument" in chunk.references):
            parent_document_uuid = str(chunk.references["belongsToDocument"].objects[0].uuid)
            insert_chunk(chunk_uuid, chunk_properties, chunk_vector
                         , parent_document_uuid)        
        else:
            print('-----------')
            print(chunk_properties)
        chunk_count += 1
        if chunk_count % 1000 == 0:
            conn.commit()

    conn.commit()  # Final commit for any remaining documents and chunks
    print("Migration completed!")


