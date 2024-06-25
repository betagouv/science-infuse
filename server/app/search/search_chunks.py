from collections import defaultdict
from langchain_text_splitters import CharacterTextSplitter
from weaviate.util import get_valid_uuid
from weaviate.classes.query import Filter, GeoCoordinate, MetadataQuery, QueryReference 
import weaviate.classes as wvc
from weaviate import WeaviateClient
from typing import List, Dict, Optional

from SIWeaviateClient import SIWeaviateClient
from schemas import ChunkWithScore, DocumentChunk, DocumentSearchResult, MediaType

# only search in chunk property
query_properties = ["chunk"]
def search_multi_documents(client: WeaviateClient, query: str, filters=None) -> List[DocumentSearchResult]:
    print("SEARCH_MULTI_DOCUMENTS 0", query)
    
    # Perform hybrid query on the DocumentChunk collection
    response = client.collections.get("DocumentChunk").query.hybrid(
        query=query,
        return_metadata=wvc.query.MetadataQuery(score=True),
        query_properties=["text"],
        filters=filters,
        return_references=[QueryReference(
            link_on="belongsToDocument", 
            return_properties=["document_id", "local_path", "original_public_path", "media_name", "max_score", "min_score"]
        )]
    )
        
    # Group the chunks by their document ID and build document search results
    document_results: Dict[str, Dict] = {}
    for chunk in response.objects:
        doc_ref = chunk.references['belongsToDocument'].objects[0].properties
        document_id = doc_ref['document_id']
        
        if document_id not in document_results:
            document_results[document_id] = {
                "properties": doc_ref,
                "chunks": []
            }
        
        score = chunk.metadata.score
        print("SEARCH_MULTI_DOCUMENTS 1 SCORE", score)
        chunk_with_score = ChunkWithScore.model_validate({**chunk.properties, "score": score})
        document_results[document_id]["chunks"].append(chunk_with_score)
    
    # Build the final response
    documents_search_response = []
    for doc_id, data in document_results.items():
        chunks_with_score = data["chunks"]
        document_properties = data["properties"]
        
        document_search_result = DocumentSearchResult(
            document_id=document_properties['document_id'],
            local_path=document_properties['local_path'],
            original_public_path=document_properties['original_public_path'],
            media_name=document_properties['media_name'],
            min_score=min(chunk.score for chunk in chunks_with_score),
            max_score=max(chunk.score for chunk in chunks_with_score),
            chunks=chunks_with_score
        )
        
        documents_search_response.append(document_search_result)
    
    return documents_search_response

# def search_single_document(client: WeaviateClient, query: str, documentId: str) -> DocumentSearchResult:
#     print("search_single_document")
#     response = client.collections.get("DocumentChunk").query.hybrid(
#         query=query,
#         query_properties=query_properties,
#         limit=1000,
#         filters=Filter.by_property("document_id").equal(get_valid_uuid(uuid=documentId)),
#         return_metadata=MetadataQuery(score=True),
#     )

#     currentDocumentChunksWithDistance: List[ChunkWithScore] = []
    
#     for _documentChunk in response.objects:
#         score = _documentChunk.metadata.score
#         cuurrentChunkWithScore = ChunkWithScore.model_validate({**_documentChunk.properties, "score": 1-score, "document_id": str(_documentChunk.properties["document_id"])})
#         currentDocumentChunksWithDistance.append(cuurrentChunkWithScore)

#     documentSearchResult = DocumentSearchResult(
#         document_id=str(documentId),
#         media_type = response.objects[0].properties['media_type'],
#         media_name = response.objects[0].properties['media_name'],
#         local_path=response.objects[0].properties['local_path'],
#         original_public_path=response.objects[0].properties['original_public_path'],
#         max_score=max(chunk.score for chunk in currentDocumentChunksWithDistance),
#         min_score=min(chunk.score for chunk in currentDocumentChunksWithDistance), 
#         chunks=currentDocumentChunksWithDistance
#     )
#     return documentSearchResult


def search_chunks_in_document(query: str, document_id: Optional[str]) -> List[DocumentSearchResult]:
    print("document_id", document_id)
    with SIWeaviateClient() as client:
        if (not document_id):
            return search_multi_documents(client, query)
        else:
            filter = Filter.by_ref(link_on="belongsToDocument").by_property("document_id").equal(get_valid_uuid(uuid=document_id))
            return search_multi_documents(client, query, filters=filter)
