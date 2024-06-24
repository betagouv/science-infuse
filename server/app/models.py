import weaviate
from weaviate.util import generate_uuid5
from weaviate.classes.config import Configure, Property, DataType, Tokenization

client = weaviate.connect_to_local()

def create_document_chunk_schema():
    client.collections.create(
        "DocumentChunk",
        vectorizer_config=Configure.Vectorizer.text2vec_transformers(),
        properties=[
            Property(name="chunk",description="a portion of a document",tokenization=Tokenization.LOWERCASE,data_type=DataType.TEXT,),
            # Property(name="document_name",data_type=DataType.TEXT,),
            # unvectorized properties
            Property(name="document_id",data_type=DataType.TEXT,skip_vectorization=True),
            Property(name="local_path",data_type=DataType.TEXT,skip_vectorization=True,description="local path of the file",),
            Property(name="original_public_path",data_type=DataType.TEXT,skip_vectorization=True,description="where the file comes from (youtube url, public url,...) "),
            Property(name="media_name",data_type=DataType.TEXT,skip_vectorization=True,description="name of the media"),
            Property(name="media_type",data_type=DataType.TEXT,skip_vectorization=True,description="type of source document"),
            Property(name="start_offset",data_type=DataType.NUMBER,skip_vectorization=True,description="start of the chunk in the original document (character or second)"),
            Property(name="end_offset",data_type=DataType.NUMBER,skip_vectorization=True,description="end of the chunk in the original document (character or second)"),
        ]
    )

create_document_chunk_schema()
