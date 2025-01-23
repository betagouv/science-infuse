from datetime import datetime
from enum import Enum
from pydantic import BaseModel, Field
from typing import Any, Literal, Optional, Union, List, TypeVar, Generic, Type, Dict

class BoundingBox(BaseModel):
    x1: float = Field(..., description="X-coordinate of the top-left corner")
    y1: float = Field(..., description="Y-coordinate of the top-left corner")
    x2: float = Field(..., description="X-coordinate of the bottom-right corner")
    y2: float = Field(..., description="Y-coordinate of the bottom-right corner")


# ==============

class MediaType(str, Enum):
    IMAGE = "image"
    PDF_IMAGE = "pdf_image"
    RAW_IMAGE = "raw_image"
    PDF_TEXT = "pdf_text"
    VIDEO_TRANSCRIPT = "video_transcript"
    WEBSITE_QA = "website_qa"
    WEBSITE = "website"
    WEBSITE_EXPERIENCE = "website_experience"

# ==============


class Document(BaseModel):
    id: str
    s3ObjectName: str
    originalPath: str
    deleted: bool = Field(default=False)
    publicPath: Optional[str] = None
    mediaName: str
    duration: Optional[float] = None
    source: str = Field(default="UniverScience")
    sourceCreationDate: Optional[datetime]
    userId: Optional[str] = None
    fileHash: Optional[str] = None

class BaseDocumentChunk(BaseModel):
    # id: str
    document: Document
    text: str = ""
    # textEmbedding: Optional[list[float]]
    title: str
    mediaType: MediaType
    metadata: Union[dict, BaseModel]


# ====
class VideoTranscriptMetadata(BaseModel):
    start: float
    end: float

class VideoTranscriptChunk(BaseDocumentChunk):
    mediaType: MediaType = MediaType.VIDEO_TRANSCRIPT
    metadata: VideoTranscriptMetadata

class PdfImageMetadata(BaseModel):
    s3ObjectName: str
    pageNumber: int
    bbox: BoundingBox

class PdfImageChunk(BaseDocumentChunk):
    mediaType: MediaType = MediaType.PDF_IMAGE
    metadata: PdfImageMetadata


class ImageMetadata(BaseModel):
    s3ObjectName: str

class ImageChunk(BaseDocumentChunk):
    mediaType: MediaType = MediaType.IMAGE
    metadata: ImageMetadata

class RawImageMetadata(BaseModel):
    s3ObjectName: str

class RawImageChunk(BaseDocumentChunk):
    mediaType: MediaType = MediaType.RAW_IMAGE
    metadata: RawImageMetadata

class PdfTextMetadata(BaseModel):
    pageNumber: int
    bbox: BoundingBox

class PdfTextChunk(BaseDocumentChunk):
    mediaType: MediaType = MediaType.PDF_TEXT
    metadata: PdfTextMetadata

class WebsiteMetadata(BaseModel):
    url: str

class WebsiteChunk(BaseDocumentChunk):
    mediaType: MediaType = MediaType.WEBSITE
    metadata: WebsiteMetadata

class WebsiteQAMetadata(BaseModel):
    question: str
    answer: str
    url: str

class WebsiteQAChunk(BaseDocumentChunk):
    mediaType: MediaType = MediaType.WEBSITE_QA
    metadata: WebsiteQAMetadata

class WebsiteExperienceMetadata(BaseModel):
    description: str
    title: str
    type: str
    url: str

class WebsiteExperienceChunk(BaseDocumentChunk):
    mediaType: MediaType = MediaType.WEBSITE_EXPERIENCE
    metadata: WebsiteExperienceMetadata

DocumentChunkMetadata = Union[RawImageMetadata, PdfImageMetadata, ImageMetadata, PdfTextMetadata, VideoTranscriptMetadata, WebsiteQAMetadata, WebsiteMetadata, WebsiteExperienceMetadata]
DocumentChunk = Union[RawImageChunk, PdfImageChunk, ImageChunk, PdfTextChunk, VideoTranscriptChunk, WebsiteQAChunk, WebsiteExperienceChunk,  WebsiteChunk]

class DocumentWithChunks(Document):
    chunks: List[DocumentChunk]

# -----------

class RerankTextQuery(BaseModel):
    query: str
    texts: List[str]

class EmbeddingQuery(BaseModel):
    text: str

class SearchQuery(BaseModel):
    query: str
    document_id: Optional[str] = None
    mediaTypes: Optional[List[str]] = None
    pageNumber: Optional[int] = 1
    page_size: Optional[int] = 20