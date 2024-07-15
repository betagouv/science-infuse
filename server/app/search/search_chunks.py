from functools import reduce
from operator import and_
from weaviate.util import get_valid_uuid
from weaviate.classes.query import Filter, QueryReference 
import weaviate.classes as wvc
from weaviate import WeaviateClient
from typing import List, Dict, Optional

from SIWeaviateClient import SIWeaviateClient
from schemas import ChunkWithScore, DocumentSearchResult, SearchQuery

# only search in some properties
query_properties = ["text", "title"]
# query_properties = ["text"]

# An alpha of 1 is a pure vector search.
# An alpha of 0 is a pure keyword search.
alpha = 0.5

def search_multi_documents(client: WeaviateClient, query: str, filters=None) -> List[DocumentSearchResult]:
    # print("SEARCH_MULTI_DOCUMENTS 0", query)
    
    # Perform hybrid query on the DocumentChunk collection
    response = client.collections.get("DocumentChunk").query.hybrid(
        query=query,
        alpha=alpha,
        return_metadata=wvc.query.MetadataQuery(score=True),
        query_properties=query_properties,
        filters=filters,
        limit=100,
        return_references=[QueryReference(
            link_on="belongsToDocument", 
            return_properties=["s3_object_name", "document_id", "public_path", "original_path", "media_name", "max_score", "min_score"]
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
            original_path=document_properties['original_path'],
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
        alpha=alpha,
        limit=20,
        return_metadata=wvc.query.MetadataQuery(score=True),
        query_properties=query_properties,
        filters=filters,
        return_references=[QueryReference(link_on="belongsToDocument", return_properties=["s3_object_name", "document_id", "public_path", "original_path", "media_name", "max_score", "min_score"])]
    )

    for chunk in response.objects:
        score = chunk.metadata.score
        document = chunk.references["belongsToDocument"].objects[0].properties
        chunk_with_score = ChunkWithScore.model_validate({**chunk.properties, "score": score, "document": document})
        chunks_search_response.append(chunk_with_score)

    return chunks_search_response





def add_filter(condition, filter_func):
    return filter_func() if condition else None

def get_filters_for_query(query: SearchQuery):
    filter_conditions = [
        (query.document_id, lambda: Filter.by_ref("belongsToDocument").by_property("document_id").equal(query.document_id)),
        (query.media_types, lambda: Filter.by_property("media_type").contains_any(query.media_types)),
    ]

    # Apply filters and remove None values
    valid_filters = [f() for condition, f in filter_conditions if condition]

    # Combine filters with & in a flat structure
    filters = reduce(and_, valid_filters) if valid_filters else None
    return filters

def search_chunks(query: SearchQuery) -> List[ChunkWithScore]:
    filters = get_filters_for_query(query)
   
    with SIWeaviateClient() as client:
        return search_all_chunks(client, query.query, filters=filters)


def search_chunks_grouped_by_document(query: SearchQuery) -> List[DocumentSearchResult]:
    filters = get_filters_for_query(query)

    with SIWeaviateClient() as client:
        return search_multi_documents(client, query.query, filters=filters)
