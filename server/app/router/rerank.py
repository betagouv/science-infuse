from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from processing.text.SIReranker import SIReranker, TextWithScore
from schemas import ChunkSearchResults, ChunkWithScore, DocumentChunk, DocumentSearchResult, DocumentSearchResults, RerankTextQuery, SearchQuery

router = APIRouter()
reranker = SIReranker()
@router.post("/text", response_model=List[TextWithScore])
async def _rerank_text(query: RerankTextQuery):
    results = reranker.sort_raw_texts(query)
    return results
