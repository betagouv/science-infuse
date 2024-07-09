from get_embeddings import embed_text
import asyncio
import itertools
from pgvector.psycopg import register_vector_async
import psycopg

# Database connection details
DB_USER = 'testuser'
DB_PASSWORD = 'testpwd'
DB_HOST = 'localhost'  # or the name of the service in docker-compose, e.g., 'postgres'
DB_PORT = '5432'
DB_NAME = 'vectordb'


from sqlalchemy import Index, create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, mapped_column
from pgvector.sqlalchemy import Vector
import numpy as np

Base = declarative_base()
N_DIM = 768

class TextEmbedding(Base):
    __tablename__ = 'text_embeddings'
    id = mapped_column(Integer, primary_key=True, autoincrement=True)
    content = mapped_column(String)
    embedding = mapped_column(Vector(N_DIM))



# Connect to PostgreSQL
engine = create_engine(f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}/{DB_NAME}")

Base.metadata.drop_all(engine)
Base.metadata.create_all(engine)
index = Index(
    'my_index',
    TextEmbedding.embedding,
    postgresql_using='ivfflat',
    postgresql_with={'lists': 100},
    postgresql_ops={'embedding': 'vector_l2_ops'}
)


index.create(engine)


# Create a session
Session = sessionmaker(bind=engine)
session = Session()

def insert_embeddings(embeddings):
    for embedding in embeddings:
        new_embedding = TextEmbedding(embedding=embedding)
        session.add(new_embedding)
    session.commit()
    
    
def find_similar_embeddings(query_embedding, limit=5):
    k = 5
    similarity_threshold = 0.7
    query = session.query(TextEmbedding, TextEmbedding.embedding.cosine_distance(query_embedding)
        .label("distance"))\
        .filter(TextEmbedding.embedding.cosine_distance(query_embedding) < similarity_threshold)\
        .order_by("distance")\
        .limit(k)\
        .all()
    return query

def main():
    sentences = ["Le chien aboie","Le chat ronronne","L'ours grogne"]
    embeddings = [embed_text(sent) for sent in sentences]*100
    for i in range(100):
        insert_embeddings(embeddings)
        print(i)

    query = 'ours grognant'
    import time

    start_time = time.time()
    response = find_similar_embeddings(embed_text(query))
    end_time = time.time()
    print(f"Time taken: {end_time - start_time} seconds")
    print("response", response)

main()