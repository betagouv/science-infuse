from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Optional

from app.schemas import DocumentChunk, DocumentSearchResult
from app.search.search_chunks import search_chunks_in_document

router = APIRouter()

class SearchQuery(BaseModel):
    query: str
    document_id: Optional[str] = None

class DocumentIDQuery(BaseModel):
    document_id: str

@router.post("/query", response_model=List[DocumentSearchResult])
async def query_search(query: SearchQuery):
    results = search_chunks_in_document(query.query, document_id=query.document_id)
    return results

# @router.post("/document", response_model=List[DocumentChunk])
# async def get_document_chunks_by_id(query: DocumentIDQuery):
#     results = get_document_chunks(query.document_id)
#     return results
