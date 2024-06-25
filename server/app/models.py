import time
import weaviate
from weaviate.classes.config import Property, DataType, ReferenceProperty, Configure, Tokenization
from weaviate.exceptions import UnexpectedStatusCodeError

def create_weaviate_schema(remove=False):
    client = weaviate.connect_to_local()
    
    if (remove):
        collections_to_remove = ["Document", "DocumentChunk"]
        for collection_name in collections_to_remove:
            if client.collections.exists(collection_name):
                client.collections.delete(collection_name)
        print("removed collections, creating fresh ones")

    if not client.collections.exists("Document"):
        # Create Document collection
        document_collection = client.collections.create(
            "Document",
            vectorizer_config=Configure.Vectorizer.text2vec_transformers(),
            properties=[
                Property(name="document_id", data_type=DataType.TEXT, skip_vectorization=True),
                Property(name="local_path", data_type=DataType.TEXT, skip_vectorization=True, description="local path of the file"),
                Property(name="original_public_path", data_type=DataType.TEXT, skip_vectorization=True, description="where the file comes from (youtube url, public url,...)"),
                Property(name="media_name", data_type=DataType.TEXT, skip_vectorization=True, description="name of the media"),
            ]
        )
    
    # Create DocumentChunk collection
    if not client.collections.exists("DocumentChunk"):
        document_chunk_collection = client.collections.create(
            "DocumentChunk",
            vectorizer_config=Configure.Vectorizer.text2vec_transformers(),
            properties=[
                Property(name="text", description="a portion of a document", tokenization=Tokenization.LOWERCASE, data_type=DataType.TEXT),
                Property(name="start_offset", data_type=DataType.NUMBER, skip_vectorization=True, description="start of the chunk in the original document (character or second)"),
                Property(name="end_offset", data_type=DataType.NUMBER, skip_vectorization=True, description="end of the chunk in the original document (character or second)"),
                Property(name="media_type", data_type=DataType.TEXT, skip_vectorization=True, description="type of source document"),
            ]
        )
        
        document_collection.config.add_reference(
            ReferenceProperty(
                name="hasChunks",
                target_collection="DocumentChunk"
            )
        )
        
        document_chunk_collection.config.add_reference(
            ReferenceProperty(
                name="belongsToDocument",
                target_collection="Document"
            )
        )