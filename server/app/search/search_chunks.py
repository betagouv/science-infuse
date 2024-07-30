import math
from functools import reduce
from operator import and_
from weaviate.util import get_valid_uuid
from weaviate.classes.query import Filter, QueryReference 
import weaviate.classes as wvc
from weaviate import WeaviateClient
from typing import List, Dict, Optional, Tuple

from SIWeaviateClient import SIWeaviateClient
from processing.text.SIReranker import SIReranker
from schemas import ChunkSearchResults, ChunkWithScore, DocumentChunkRegistry, DocumentSearchResult, DocumentSearchResults, MetadataRegistry, SearchQuery

# only search in some properties
query_properties = ["text", "title"]
# query_properties = ["text"]

# An alpha of 1 is a pure vector search.
# An alpha of 0 is a pure keyword search.
alpha = 0.75

reranker = SIReranker()


def search_multi_documents(
    client: WeaviateClient,
    query: str,
    page: int = 1,
    page_size: int = 20,
    filters: Optional[dict] = None
) -> DocumentSearchResults:
    document_chunk_collection = client.collections.get("DocumentChunk")
    document_collection = client.collections.get("Document")
    
    # Calculate offset based on page and page_size
    offset = (page - 1) * page_size

    # Perform hybrid query on the DocumentChunk collection
    response = document_chunk_collection.query.hybrid(
        query=query,
        alpha=alpha,
        return_metadata=wvc.query.MetadataQuery(score=True),
        query_properties=query_properties,
        filters=filters,
        limit=page_size,
        offset=offset,
        return_references=[QueryReference(
            link_on="belongsToDocument", 
            return_properties=["s3_object_name", "document_id", "public_path", "original_path", "media_name", "max_score", "min_score"]
        )]
    )

    # Group the chunks by their document ID and build document search results
    document_results: Dict[str, Dict] = {}
    for chunk in response.objects:
        document = chunk.references['belongsToDocument'].objects[0].properties
        document_uuid = str(chunk.references['belongsToDocument'].objects[0].uuid)
        document_id = document['document_id']
        
        if document_id not in document_results:
            document_results[document_id] = {
                "properties": document,
                "uuid": document_uuid,
                "chunks": []
            }
        
        score = chunk.metadata.score
        chunk_with_score = ChunkWithScore.model_validate({**chunk.properties, "score": score, "document": {**document, "uuid": document_uuid}, "uuid": str(chunk.uuid)})
        document_results[document_id]["chunks"].append(chunk_with_score)
    
    # Build the final response
    documents_search_response = []
    for doc_id, data in document_results.items():
        chunks_with_score = data["chunks"]
        document_properties = data["properties"]
        document_uuid = data["uuid"]
        
        document_search_result = DocumentSearchResult(
            uuid=document_uuid,
            document_id=document_properties['document_id'],
            public_path=document_properties['public_path'],
            original_path=document_properties['original_path'],
            media_name=document_properties['media_name'],
            min_score=min(chunk.score for chunk in chunks_with_score),
            max_score=max(chunk.score for chunk in chunks_with_score),
            chunks=chunks_with_score
        )
        
        documents_search_response.append(document_search_result)

    total_results = document_collection.aggregate.over_all(total_count=True).total_count
    # Do not display more than 10 pages (hy)
    page_count = min(10, math.ceil(total_results / page_size))

    return DocumentSearchResults(documents=documents_search_response, page_count=page_count)


def search_all_chunks(client: WeaviateClient, query: str, page: int = 1, page_size: int = 20, filters: Optional[dict] = None) -> ChunkSearchResults:
    document_chunk = client.collections.get("DocumentChunk")
    
    all_properties = DocumentChunkRegistry.get_properties() + [f"meta_{prop}" for prop in MetadataRegistry.get_properties()]

    # Calculate offset based on page and page_size
    offset = (page - 1) * page_size


    # Perform the main search query
    response = document_chunk.query.hybrid(
        query=query,
        alpha=alpha,
        limit=page_size,
        offset=offset,
        return_metadata=wvc.query.MetadataQuery(score=True),
        query_properties=query_properties,
        filters=filters,
        return_references=[QueryReference(link_on="belongsToDocument", return_properties=all_properties)]
    )

    chunks_search_response = []
    for chunk in response.objects:
        score = chunk.metadata.score
        document = {**chunk.references["belongsToDocument"].objects[0].properties, "uuid": str(chunk.references["belongsToDocument"].objects[0].uuid)}
        chunk_with_score = ChunkWithScore.model_validate({**chunk.properties, "score": score, "document": document, "uuid": str(chunk.uuid)})
        chunks_search_response.append(chunk_with_score)


    total_results = document_chunk.aggregate.over_all(total_count=True).total_count
    # Do not display more than 10 pages (hy)
    page_count = min(10, math.ceil(total_results / page_size))
    return ChunkSearchResults(chunks=chunks_search_response, page_count=page_count)




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

def search_chunks(query: SearchQuery) -> ChunkSearchResults:
    filters = get_filters_for_query(query)
    with SIWeaviateClient() as client:
        searchResult = search_all_chunks(client, query.query, page=query.page_number, page_size=query.page_size, filters=filters)
        searchResult.chunks = reranker.sort_document_chunks(document_chunks=searchResult.chunks, query=query.query)
        return searchResult


def search_chunks_grouped_by_document(query: SearchQuery) -> DocumentSearchResults:
    filters = get_filters_for_query(query)
    with SIWeaviateClient() as client:
        return search_multi_documents(client, query.query, page=query.page_number, page_size=query.page_size, filters=filters)
