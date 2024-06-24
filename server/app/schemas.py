from typing import List, Literal
from pydantic import BaseModel
from enum import Enum

class MediaType(Enum):
    AUDIO = "audio"
    VIDEO = "video"
    YOUTUBE = "youtube"
    TEXT = "text"

class DocumentChunk(BaseModel):
    chunk: str
    document_id: str
    local_path: str
    original_public_path: str
    media_type: str
    media_name: str
    start_offset: int
    end_offset: int

class ImportDocument(BaseModel):
    original_public_path: str
    

class SearchQuery(BaseModel):
    query: str



class DocumentIDQuery(BaseModel):
    document_id: str


# ##################
class ChunkWithDistance(DocumentChunk):
    distance: float

class DocumentSearchResult(BaseModel):
    document_id: str
    local_path: str
    original_public_path: str
    media_name: str
    media_type: str
    max_distance: float
    min_distance: float
    chunks: List[ChunkWithDistance]