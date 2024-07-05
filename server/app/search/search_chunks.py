from weaviate.util import get_valid_uuid
from weaviate.classes.query import Filter, QueryReference 
import weaviate.classes as wvc
from weaviate import WeaviateClient
from typing import List, Dict, Optional

from SIWeaviateClient import SIWeaviateClient
from schemas import ChunkWithScore, DocumentSearchResult, SearchQuery

# only search in chunk property
query_properties = ["chunk"]
def search_multi_documents(client: WeaviateClient, query: str, filters=None) -> List[DocumentSearchResult]:
    # print("SEARCH_MULTI_DOCUMENTS 0", query)
    
    # Perform hybrid query on the DocumentChunk collection
    response = client.collections.get("DocumentChunk").query.hybrid(
        query=query,
        return_metadata=wvc.query.MetadataQuery(score=True),
        query_properties=["text"],
        filters=filters,
        limit=100,
        return_references=[QueryReference(
            link_on="belongsToDocument", 
            return_properties=["document_id", "public_path", "original_public_path", "media_name", "max_score", "min_score"]
        )]
    )
        
    # Group the chunks by their document ID and build document search results
    document_results: Dict[str, Dict] = {}
    for chunk in response.objects:
        document = chunk.references['belongsToDocument'].objects[0].properties
        document_id = document['document_id']
        
        if document_id not in document_results:
            document_results[document_id] = {
                "properties": document,
                "chunks": []
            }
        
        score = chunk.metadata.score
        # print("SEARCH_MULTI_DOCUMENTS 1 SCORE", score)
        chunk_with_score = ChunkWithScore.model_validate({**chunk.properties, "score": score, "document": document})
        document_results[document_id]["chunks"].append(chunk_with_score)
    
    # Build the final response
    documents_search_response = []
    for doc_id, data in document_results.items():
        chunks_with_score = data["chunks"]
        document_properties = data["properties"]
        
        document_search_result = DocumentSearchResult(
            document_id=document_properties['document_id'],
            public_path=document_properties['public_path'],
            original_public_path=document_properties['original_public_path'],
            media_name=document_properties['media_name'],
            min_score=min(chunk.score for chunk in chunks_with_score),
            max_score=max(chunk.score for chunk in chunks_with_score),
            chunks=chunks_with_score
        )
        
        documents_search_response.append(document_search_result)
    
    return documents_search_response


def search_all_chunks(client: WeaviateClient, query: str, filters=None) -> List[ChunkWithScore]:
    document_chunk = client.collections.get("DocumentChunk")
    
    chunks_search_response = []
    
    response = document_chunk.query.hybrid(
        query=query,
        return_metadata=wvc.query.MetadataQuery(score=True),
        query_properties=["text"],
        filters=filters,
        return_references=[QueryReference(link_on="belongsToDocument", return_properties=["document_id", "public_path", "original_public_path", "media_name", "max_score", "min_score"])]
    )

    for chunk in response.objects:
        score = chunk.metadata.score
        document = chunk.references["belongsToDocument"].objects[0].properties
        chunk_with_score = ChunkWithScore.model_validate({**chunk.properties, "score": score, "document": document})
        chunks_search_response.append(chunk_with_score)

    return chunks_search_response

def search_chunks(query: SearchQuery) -> List[ChunkWithScore]:
    filters = None
    if (query.media_types):
        filters = Filter.by_property("media_type").contains_any(query.media_types) # TODO ADD

    with SIWeaviateClient() as client:
        if (not query.document_id):
            return search_all_chunks(client, query.query, filters=filters)
        return []
        # else:
        #     document_id_filter = Filter.by_ref(link_on="belongsToDocument").by_property("document_id").equal(get_valid_uuid(uuid=document_id))
        #     return search_multi_documents(client, query, filters=document_id_filter)


def search_chunks_grouped_by_document(query: SearchQuery) -> List[DocumentSearchResult]:
    filters = None
    if (query.media_types):
        filters = Filter.by_property("media_type").contains_any(query.media_types)

    with SIWeaviateClient() as client:
        if (not query.document_id):
            return search_multi_documents(client, query.query, filters=filters)
        else:
            print("FILTERS", filters)
            # TODO ADD
            filters = Filter.by_ref(link_on="belongsToDocument").by_property("document_id").equal(get_valid_uuid(uuid=query.document_id)) 
            return search_multi_documents(client, query.query, filters=filters)
