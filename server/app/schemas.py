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
    PDF_IMAGE = "pdf_image"
    RAW_IMAGE = "raw_image"
    PDF_TEXT = "pdf_text"
    VIDEO_TRANSCRIPT = "video_transcript"
    WEBSITE_QA = "website_qa"
    WEBSITE_EXPERIENCE = "website_experience"

class DocumentChunkRegistry:
    _registry: Dict[MediaType, Type['BaseDocumentChunk']] = {}
    _properties: List[str] = []
    @classmethod
    def register(cls, chunk_class: Type['BaseDocumentChunk']):
        if ("media_type" in chunk_class.model_fields):
            media_type = chunk_class.model_fields['media_type'].default
            cls._registry[media_type] = chunk_class

        cls._properties.extend([prop for prop in list(chunk_class.model_fields.keys()) if prop not in cls._properties and prop != "metadata"])

        return chunk_class

    @classmethod
    def get(cls, media_type: MediaType) -> Type['BaseDocumentChunk']:
        return cls._registry.get(media_type)


    @classmethod
    def all(cls) -> List[Type['BaseDocumentChunk']]:
        return list(cls._registry.values())

    @classmethod
    def get_properties(cls) -> List[Type['BaseDocumentChunk']]:
        return cls._properties

    @classmethod
    def media_types(cls) -> List[MediaType]:
        return list(cls._registry.keys())

def register_document_chunk(cls: Type['BaseDocumentChunk']) -> Type['BaseDocumentChunk']:
    return DocumentChunkRegistry.register(cls)

class MetadataRegistry:
    _properties: List[str] = []

    @classmethod
    def register(cls, metadata_class: Type['BaseModel']):
        cls._properties.extend(list(metadata_class.model_fields.keys()))
        return metadata_class

    @classmethod
    def get(cls, media_type: MediaType) -> Type['BaseModel']:
        return cls._properties.get(media_type)

    @classmethod
    def get_properties(cls) -> List[Type['BaseModel']]:
        return cls._properties

def register_metadata(cls: Type['BaseModel']) -> Type['BaseModel']:
    return MetadataRegistry.register(cls)

# ==============


@register_document_chunk
class Document(BaseModel):
    uuid: Optional[str] = Field(default="")
    document_id: str
    public_path: Optional[str] = Field(default="")
    original_path: str
    s3_object_name: Optional[str] = Field(default="")
    user_approved: Optional[bool] = Field(default=False)
    user_disapproved: Optional[bool] = Field(default=False)
    media_name: str


class BaseDocumentChunk(BaseModel):
    uuid: Optional[str] = Field(default="")
    document: Document
    text: str = ""
    title: str
    media_type: MediaType
    user_approved: Optional[bool] = Field(default=False)
    user_disapproved: Optional[bool] = Field(default=False)
    metadata: Union[dict, BaseModel]

    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        DocumentChunkRegistry.register(cls)

    @classmethod
    def model_validate(cls, obj: Any, *args, **kwargs):
        if isinstance(obj, dict):
            metadata = {}
            for key in list(obj.keys()):
                if key.startswith('meta_'):
                    metadata[key[5:]] = obj.pop(key)
            if metadata:
                obj['metadata'] = metadata
        return super().model_validate(obj, *args, **kwargs)

@register_metadata
class VideoTranscriptMetadata(BaseModel):
    start: float
    end: float

@register_document_chunk
class VideoTranscriptChunk(BaseDocumentChunk):
    media_type: MediaType = MediaType.VIDEO_TRANSCRIPT
    metadata: VideoTranscriptMetadata

@register_metadata
class PdfImageMetadata(BaseModel):
    s3_object_name: str
    page_number: int
    bbox: BoundingBox

@register_document_chunk
class PdfImageChunk(BaseDocumentChunk):
    media_type: MediaType = MediaType.PDF_IMAGE
    metadata: PdfImageMetadata

@register_metadata
class RawImageMetadata(BaseModel):
    s3_object_name: str

@register_document_chunk
class RawImageChunk(BaseDocumentChunk):
    media_type: MediaType = MediaType.RAW_IMAGE
    metadata: RawImageMetadata

@register_metadata
class PdfTextMetadata(BaseModel):
    page_number: int
    bbox: BoundingBox

@register_document_chunk
class PdfTextChunk(BaseDocumentChunk):
    media_type: MediaType = MediaType.PDF_TEXT
    metadata: PdfTextMetadata

@register_metadata
class WebsiteQAMetadata(BaseModel):
    question: str
    answer: str
    url: str

@register_document_chunk
class WebsiteQAChunk(BaseDocumentChunk):
    media_type: MediaType = MediaType.WEBSITE_QA
    metadata: WebsiteQAMetadata

@register_metadata
class WebsiteExperienceMetadata(BaseModel):
    description: str
    title: str
    type: str
    url: str

@register_document_chunk
class WebsiteExperienceChunk(BaseDocumentChunk):
    media_type: MediaType = MediaType.WEBSITE_EXPERIENCE
    metadata: WebsiteExperienceMetadata

DocumentChunkMetadata = Union[RawImageMetadata, PdfImageMetadata, PdfTextMetadata, VideoTranscriptMetadata, WebsiteQAMetadata, WebsiteExperienceMetadata]
DocumentChunk = Union[RawImageChunk, PdfImageChunk, PdfTextChunk, VideoTranscriptChunk, WebsiteQAChunk, WebsiteExperienceChunk]

ChunkType = TypeVar('ChunkType', bound=BaseDocumentChunk)

class ChunkWithScore(Generic[ChunkType], BaseDocumentChunk):
    metadata: DocumentChunkMetadata
    score: float

    @classmethod
    def model_validate(cls, obj: Any, *args, **kwargs):
        if isinstance(obj, dict):
            metadata = {}
            for key in list(obj.keys()):
                if key.startswith('meta_'):
                    metadata[key[5:]] = obj.pop(key)
            if metadata:
                obj['metadata'] = metadata

            chunk_type = DocumentChunkRegistry.get(MediaType(obj['media_type']))
            if chunk_type:
                metadata_type = chunk_type.__annotations__['metadata']
                obj['metadata'] = metadata_type.model_validate(obj['metadata'])
        return super().model_validate(obj, *args, **kwargs)

class DocumentWithChunks(Document):
    chunks: List[DocumentChunk]

# -----------

class ImportDocument(BaseModel):
    original_path: str
    

class SearchQuery(BaseModel):
    query: str
    document_id: Optional[str] = None
    media_types: Optional[List[str]] = None
    page_number: Optional[int] = 1
    page_size: Optional[int] = 20
    
    
    
class UserApproveQuery(BaseModel):
    approve: bool
    uuid: str    

class DocumentSearchResult(BaseModel):
    uuid: str
    document_id: str
    public_path: str
    original_path: str
    media_name: str
    max_score: float
    min_score: float
    chunks: List[ChunkWithScore]

class DocumentSearchResults(BaseModel):
    documents: List[DocumentSearchResult]
    page_count: int

class ChunkSearchResults(BaseModel):
    chunks: List[ChunkWithScore]
    page_count: int