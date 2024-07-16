from weaviate import WeaviateClient
from weaviate.classes.config import Property, DataType

def migrate(client: WeaviateClient):
    document = client.collections.get("Document")
    if (not document.config._get_property_by_name('user_approved')):
        document.config.add_property(
            Property(  
                name="user_approved",  
                data_type=DataType.BOOL,
            )  
        )  
    if (not document.config._get_property_by_name('user_disapproved')):
        document.config.add_property(
            Property(  
                name="user_disapproved",  
                data_type=DataType.BOOL,
            )  
        )  
    documentChunk = client.collections.get("DocumentChunk")    
    if (not documentChunk.config._get_property_by_name('user_approved')):
        documentChunk.config.add_property(
            Property(  
                name="user_approved",  
                data_type=DataType.BOOL,
            )  
        )  
    if (not documentChunk.config._get_property_by_name('user_disapproved')):
        documentChunk.config.add_property(
            Property(  
                name="user_disapproved",  
                data_type=DataType.BOOL,
            )  
        )  
