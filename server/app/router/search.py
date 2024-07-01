from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from schemas import ChunkWithScore, DocumentChunk, DocumentSearchResult
from search.search_chunks import search_chunks_grouped_by_document, search_chunks

router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    document_id: Optional[str] = None


@router.post("/search_chunks_grouped_by_document", response_model=List[DocumentSearchResult])
async def _search_chunks_grouped_by_document(query: SearchQuery):
    results = search_chunks_grouped_by_document(query.query, document_id=query.document_id)
    return results

@router.post("/search_chunks", response_model=List[ChunkWithScore])
async def _search_chunks(query: SearchQuery):
    results = search_chunks(query.query, document_id=query.document_id)
    return results

# @router.post("/document", response_model=List[DocumentChunk])
# async def get_document_chunks_by_id(query: DocumentIDQuery):
#     results = get_document_chunks(query.document_id)
#     return results
