from enum import Enum
from pydantic import BaseModel, Field
from typing import Any, Literal, Optional, Union, List, Literal, TypeVar, Generic

class BoundingBox(BaseModel):
    """
    Represents a bounding box with coordinates for the top-left and bottom-right corners.
    """
    x1: float = Field(..., description="X-coordinate of the top-left corner")
    y1: float = Field(..., description="Y-coordinate of the top-left corner")
    x2: float = Field(..., description="X-coordinate of the bottom-right corner")
    y2: float = Field(..., description="Y-coordinate of the bottom-right corner")


class Document(BaseModel):
    document_id: str
    public_path: Optional[str] = Field(default="")
    original_path: str
    s3_object_name: Optional[str] = Field(default="")
    media_name: str

class BaseDocumentChunk(BaseModel):
    """
    Every document chunk has a text property in which we will do the semantic search\n
    This class is implemented to represent different types of chunks (media_type)\n
    Every implementation will have a metadata field with custom properties (e.g., for PdfImage, we need to know the page_number where the image was found).    """
    document: Document
    # title defaults to ""
    text: str = ""
    title: str
    media_type: Literal[
        "pdf_image", "raw_image",
        "pdf_text", 
        "video_transcript",
        "website_qa", "website_experience"
    ]
    metadata: Union[dict, BaseModel]

    @classmethod
    def model_validate(cls, obj: Any, *args, **kwargs):
        """
        https://github.com/weaviate/weaviate/issues/3694
        migrate back weaviate fields like meta_xxx:yyy to metadata: {xxx: yyy}
        """
        if isinstance(obj, dict):
            metadata = {}
            for key in list(obj.keys()):
                if key.startswith('meta_'):
                    metadata[key[5:]] = obj.pop(key)
            if metadata:
                obj['metadata'] = metadata
        return super().model_validate(obj, *args, **kwargs)

# VideoTranscript : text part of a video
class VideoTranscriptMetadata(BaseModel):
    start: float
    end: float
    
class VideoTranscriptChunk(BaseDocumentChunk):
    media_type: Literal["video_transcript"] = "video_transcript"
    metadata: VideoTranscriptMetadata

# PdfImage
class PdfImageMetadata(BaseModel):
    s3_object_name: str
    page_number: int
    bbox: BoundingBox

class PdfImageChunk(BaseDocumentChunk):
    media_type: Literal["pdf_image"] = "pdf_image"
    metadata: PdfImageMetadata

# RawImage
class RawImageMetadata(BaseModel):
    s3_object_name: str
class RawImageChunk(BaseDocumentChunk):
    media_type: Literal["raw_image"] = "raw_image"
    metadata: RawImageMetadata

# PdfText : portion of a text in a document
class PdfTextMetadata(BaseModel):
    page_number: int
    bbox:BoundingBox

class PdfTextChunk(BaseDocumentChunk):
    media_type: Literal["pdf_text"] = "pdf_text"
    metadata: PdfTextMetadata

# WebsiteQA : Question Answer in a website
class WebsiteQAMetadata(BaseModel):
    question: str
    answer: str
    url: str

class WebsiteQAChunk(BaseDocumentChunk):
    media_type: Literal["website_qa"] = "website_qa"
    metadata: WebsiteQAMetadata

# WebsiteExperience
class WebsiteExperienceMetadata(BaseModel):
    description: str
    title: str
    type: str
    url: str

class WebsiteExperienceChunk(BaseDocumentChunk):
    media_type: Literal["website_experience"] = "website_experience"
    metadata: WebsiteExperienceMetadata



DocumentChunkMetadata = Union[RawImageMetadata, PdfImageMetadata, PdfTextMetadata, VideoTranscriptMetadata, WebsiteQAMetadata, WebsiteExperienceMetadata]
DocumentChunk = Union[RawImageChunk, PdfImageChunk, PdfTextChunk, VideoTranscriptChunk, WebsiteQAChunk, WebsiteExperienceChunk]

# ChunkWithScore
ChunkType = TypeVar('ChunkType', bound=BaseDocumentChunk)

class DocumentWithChunks(Document):
    chunks: List[DocumentChunk]

class ChunkWithScore(Generic[ChunkType], BaseDocumentChunk):
    metadata: DocumentChunkMetadata
    score: float


# -----------

class ImportDocument(BaseModel):
    original_path: str
    

class SearchQuery(BaseModel):
    query: str
    document_id: Optional[str] = None
    media_types: Optional[List[str]] = None
    
    

class DocumentSearchResult(BaseModel):
    document_id: str
    public_path: str
    original_path: str
    media_name: str
    max_score: float
    min_score: float
    chunks: List[ChunkWithScore]