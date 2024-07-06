import time
import weaviate
from weaviate.classes.config import Property, DataType, ReferenceProperty, Configure, Tokenization
from weaviate.exceptions import UnexpectedStatusCodeError

from SIWeaviateClient import SIWeaviateClient

def create_weaviate_schema(remove=False):
    with SIWeaviateClient() as client:
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
                    Property(name="public_path", data_type=DataType.TEXT, skip_vectorization=True, description="local path of the file"),
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
                    Property(name="title", description="the title of the document / or subsection of the document", tokenization=Tokenization.LOWERCASE, data_type=DataType.TEXT),
                    Property(name="media_type", data_type=DataType.TEXT, skip_vectorization=True, description="type of source document"),
                    Property(name="metadata", 
                            data_type=DataType.OBJECT, 
                            skip_vectorization=True, 
                            description="metadata of the chunk, dependent on the media_type",
                            nested_properties=[
                                #  image metadata
                                Property(name="public_path", data_type=DataType.TEXT, skip_vectorization=True),
                                Property(name="page_number", description="[optional] if in document, page where the image can be found", data_type=DataType.INT, skip_vectorization=True),
                                Property(name="bbox", description="[optional] bounding box", data_type=DataType.OBJECT, skip_vectorization=True, nested_properties=[
                                    Property(name="x1", data_type=DataType.NUMBER),
                                    Property(name="y1", data_type=DataType.NUMBER),
                                    Property(name="x2", data_type=DataType.NUMBER),
                                    Property(name="y2", data_type=DataType.NUMBER)
                                ]),
                                Property(name="start", data_type=DataType.NUMBER, skip_vectorization=True,),
                                Property(name="end", data_type=DataType.NUMBER, skip_vectorization=True),
                            ]
                    ),
                ]
            )
            
            client.collections.get('Document').config.add_reference(
                ReferenceProperty(
                    name="hasChunks",
                    target_collection="DocumentChunk"
                )
            )
            
            client.collections.get('DocumentChunk').config.add_reference(
                ReferenceProperty(
                    name="belongsToDocument",
                    target_collection="Document"
                )
            )