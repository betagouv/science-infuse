from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from schemas import ChunkWithScore, DocumentChunk, DocumentSearchResult, SearchQuery
from search.search_chunks import search_chunks_grouped_by_document, search_chunks

router = APIRouter()




@router.post("/search_chunks_grouped_by_document", response_model=List[DocumentSearchResult])
async def _search_chunks_grouped_by_document(query: SearchQuery):
    results = search_chunks_grouped_by_document(query.query, document_id=query.document_id)
    return results

@router.post("/search_chunks", response_model=List[ChunkWithScore])
async def _search_chunks(query: SearchQuery):
    results = search_chunks(query.query, document_id=query.document_id)
    return results
