from langchain_text_splitters import CharacterTextSplitter
from weaviate.util import get_valid_uuid
from weaviate.classes.query import Filter, GeoCoordinate, MetadataQuery, QueryReference 
import weaviate.classes as wvc
from weaviate import WeaviateClient
from typing import List, Dict, Optional

from app.SIWeaviateClient import SIWeaviateClient
from app.schemas import ChunkWithDistance, DocumentChunk, DocumentSearchResult, MediaType

# only search in chunk property
query_properties = ["chunk"]
def search_multi_documents(client: WeaviateClient, query: str) -> List[DocumentSearchResult]:
    response = client.collections.get("DocumentChunk").query.hybrid(
        query=query,
        query_properties=query_properties,
        # auto_limit=1,
        # distance=0.85,
        return_metadata=wvc.query.MetadataQuery(distance=True),
        group_by=wvc.query.GroupBy(
                prop="local_path",
                number_of_groups=10,
                objects_per_group=10
        )
    )

    documentsSearchResponse = []

    for local_path, group in response.groups.items():  # View by group
        max_distance = group.max_distance
        min_distance = group.min_distance
        currentDocumentChunksWithDistance = []
        print(f"Group {local_path} has {len(group.objects)} objects")
        
        for _documentChunk in group.objects:
            distance = _documentChunk.metadata.distance
            cuurrentChunkWithDistance = ChunkWithDistance.model_validate({**_documentChunk.properties, "distance": distance, "document_id": str(_documentChunk.properties["document_id"])})
            currentDocumentChunksWithDistance.append(cuurrentChunkWithDistance)
        
        documentSearchResult = DocumentSearchResult(
            document_id=str(group.objects[0].properties['document_id']),
            media_name=group.objects[0].properties['media_name'],
            media_type=group.objects[0].properties['media_type'],
            local_path=local_path,
            original_public_path=group.objects[0].properties['original_public_path'],
            max_distance=max_distance,
            min_distance=min_distance, 
            chunks=currentDocumentChunksWithDistance
        )
        documentsSearchResponse.append(documentSearchResult)
    return documentsSearchResponse

def search_single_document(client: WeaviateClient, query: str, documentId: str) -> DocumentSearchResult:
    response = client.collections.get("DocumentChunk").query.hybrid(
        query=query,
        query_properties=query_properties,
        limit=1000,
        filters=Filter.by_property("document_id").equal(get_valid_uuid(uuid=documentId)),
        return_metadata=MetadataQuery(score=True),
    )

    currentDocumentChunksWithDistance = []
    
    for _documentChunk in response.objects:
        score = _documentChunk.metadata.score
        cuurrentChunkWithDistance = ChunkWithDistance.model_validate({**_documentChunk.properties, "distance": 1-score, "document_id": str(_documentChunk.properties["document_id"])})
        currentDocumentChunksWithDistance.append(cuurrentChunkWithDistance)

    documentSearchResult = DocumentSearchResult(
        document_id=str(documentId),
        media_type = response.objects[0].properties['media_type'],
        media_name = response.objects[0].properties['media_name'],
        local_path=response.objects[0].properties['local_path'],
        original_public_path=response.objects[0].properties['original_public_path'],
        max_distance=max(chunk.distance for chunk in currentDocumentChunksWithDistance),
        min_distance=min(chunk.distance for chunk in currentDocumentChunksWithDistance), 
        chunks=currentDocumentChunksWithDistance
    )
    return documentSearchResult


def search_chunks_in_document(query: str, document_id: Optional[str]) -> List[DocumentSearchResult]:
    print("document_id", document_id)
    with SIWeaviateClient() as client:
        if (not document_id):
            return search_multi_documents(client, query)
        else:
            return [search_single_document(client, query, document_id)]
