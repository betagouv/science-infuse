from typing import List, Literal
from pydantic import BaseModel
from enum import Enum


# weaviate
class DocumentChunk(BaseModel):
    text: str
    media_type: str
    start_offset: int
    end_offset: int

class WeaviateReference(BaseModel):
    beacon: str
class Document(BaseModel):
    # chunks: List[DocumentChunk]
    chunks: List[DocumentChunk]
    document_id: str
    local_path: str
    original_public_path: str
    media_name: str
    
# -----------


class MediaType(Enum):
    AUDIO = "audio"
    VIDEO = "video"
    YOUTUBE = "youtube"
    TEXT = "text"
class ImportDocument(BaseModel):
    original_public_path: str
    

class SearchQuery(BaseModel):
    query: str



class DocumentIDQuery(BaseModel):
    document_id: str


# ##################
class ChunkWithScore(DocumentChunk):
    score: float

class DocumentSearchResult(BaseModel):
    document_id: str
    local_path: str
    original_public_path: str
    media_name: str
    max_score: float
    min_score: float
    chunks: List[ChunkWithScore]