from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from search.search_chunks import reranker
from processing.text.SIReranker import TextWithScore
from schemas import ChunkSearchResults, ChunkWithScore, DocumentChunk, DocumentSearchResult, DocumentSearchResults, RerankTextQuery, SearchQuery
from search.search_chunks import search_chunks_grouped_by_document, search_chunks

router = APIRouter()

@router.post("/text", response_model=List[TextWithScore])
async def _rerank_text(query: RerankTextQuery):
    results = reranker.sort_raw_texts(query)
    return results
