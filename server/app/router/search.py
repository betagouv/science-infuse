from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from schemas import ChunkSearchResults, ChunkWithScore, DocumentChunk, DocumentSearchResult, DocumentSearchResults, SearchQuery
from search.search_chunks import search_chunks_grouped_by_document, search_chunks

router = APIRouter()




@router.post("/search_chunks_grouped_by_document", response_model=DocumentSearchResults)
async def _search_chunks_grouped_by_document(query: SearchQuery):
    results = search_chunks_grouped_by_document(query)
    return results

@router.post("/search_chunks", response_model=ChunkSearchResults)
async def _search_chunks(query: SearchQuery):
    results = search_chunks(query)
    return results
