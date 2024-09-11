from fastapi import APIRouter
from typing import List

from processing.text.SIReranker import SIReranker, TextWithScore
from schemas import RerankTextQuery

router = APIRouter()
reranker = SIReranker()
@router.post("/text", response_model=List[TextWithScore])
async def _rerank_text(query: RerankTextQuery):
    results = reranker.sort_raw_texts(query)
    return results
