from enum import Enum
from pydantic import BaseModel, Field
from typing import Literal, Optional, Union, List, Literal, TypeVar, Generic

# every document chunk will have a text property in which we will search
class BaseDocumentChunk(BaseModel):
    text: str
    media_type: Literal["image", "text", "videoTranscript"]

# VideoTranscript : text part of a video
class VideoTranscriptMetadata(BaseModel):
    video_start_offset: float
    video_end_offset: float
    
class VideoTranscriptChunk(BaseDocumentChunk):
    media_type: Literal["videoTranscript"] = "videoTranscript"
    metadata: VideoTranscriptMetadata

# Image
class ImageMetadata(BaseModel):
    public_path: str
    page_number: Optional[int]
    width: int
    height: int

class ImageChunk(BaseDocumentChunk):
    media_type: Literal["image"] = "image"
    metadata: ImageMetadata

# Text : portion of a text in a document
class TextMetadata(BaseModel):
    # page: int
    text_start_offset: int
    text_end_offset: int

class TextChunk(BaseDocumentChunk):
    media_type: Literal["text"] = "text"
    metadata: TextMetadata

DocumentChunkMetadata = Union[ImageMetadata, TextMetadata, VideoTranscriptMetadata]
DocumentChunk = Union[ImageChunk, TextChunk, VideoTranscriptChunk]

# ChunkWithScore
ChunkType = TypeVar('ChunkType', bound=BaseDocumentChunk)
class ChunkWithScore(Generic[ChunkType], BaseDocumentChunk):
    metadata: DocumentChunkMetadata
    score: float

class Document(BaseModel):
    chunks: List[DocumentChunk]
    document_id: str
    local_path: str
    original_public_path: str
    media_name: str


# -----------

class ImportDocument(BaseModel):
    original_public_path: str
    

class SearchQuery(BaseModel):
    query: str
    document_id: Optional[str] = None
    

class DocumentSearchResult(BaseModel):
    document_id: str
    local_path: str
    original_public_path: str
    media_name: str
    max_score: float
    min_score: float
    chunks: List[ChunkWithScore]