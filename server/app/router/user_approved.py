from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from services import approve_document, approve_document_chunk
from schemas import UserApproveQuery
from search.search_chunks import search_chunks_grouped_by_document, search_chunks

router = APIRouter()


@router.post("/document_chunk")
async def _approve_document_chunk(query: UserApproveQuery):
    results = approve_document_chunk(query)
    return results

@router.post("/document")
async def _approve_document_chunk(query: UserApproveQuery):
    results = approve_document(query)
    return results
