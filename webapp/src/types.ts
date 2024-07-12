//  this should match schema.py

const MediaType = {
  PdfImage: "pdf_image",
  RawImage: "raw_image",
  PdfText: "pdf_text",
  VideoTranscript: "video_transcript",
  WebsiteQa: "website_qa",
  WebsiteExperience: "website_experience",
} as const;

type MediaType = typeof MediaType[keyof typeof MediaType];

export const availableMediaTypes = Object.values(MediaType);

export interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
}
export interface BaseDocumentChunk<T extends MediaType> {
  text: string;
  title: string;
  document: Document,
  media_type: T;
  metadata: MetadataType<T>;
}

export interface VideoTranscriptMetadata {
  start: number;
  end: number;
}

export interface RawImageMetadata {
  public_path: string;
}

export interface PdfImageMetadata {
  s3_object_name: string;
  page_number: number;
  bbox: BoundingBox;
}

export interface PdfTextMetadata {
  page_number: number;
  bbox: BoundingBox;
}

export interface WebsiteQAMetadata {
  question: string;
  answer: string;
  url: string;
}

export interface WebsiteExperienceMetadata {
  description: string;
  title: string;
  type: string;
  url: string;
}



type MetadataType<T extends MediaType> =
  T extends "pdf_image" ? PdfImageMetadata :
  T extends "raw_image" ? RawImageMetadata :
  T extends "pdf_text" ? PdfTextMetadata :
  T extends "video_transcript" ? VideoTranscriptMetadata :
  T extends "website_qa" ? WebsiteQAMetadata :
  T extends "website_experience" ? WebsiteExperienceMetadata :
  never;

export type VideoTranscriptChunk = BaseDocumentChunk<"video_transcript">;
export type PdfImageChunk = BaseDocumentChunk<"pdf_image">;
export type RawImageChunk = BaseDocumentChunk<"raw_image">;
export type PdfTextChunk = BaseDocumentChunk<"pdf_text">;
export type WebsiteQAChunk = BaseDocumentChunk<"website_qa">;
export type WebsiteExperienceChunk = BaseDocumentChunk<"website_experience">;

export type DocumentChunk = VideoTranscriptChunk | PdfImageChunk | RawImageChunk | PdfTextChunk | WebsiteQAChunk;

export interface ChunkWithScore<T extends MediaType> extends BaseDocumentChunk<T> {
  score: number;
}

export type ChunkWithScoreUnion =
  | (ChunkWithScore<"pdf_image"> & { media_type: "pdf_image" })
  | (ChunkWithScore<"raw_image"> & { media_type: "raw_image" })
  | (ChunkWithScore<"pdf_text"> & { media_type: "pdf_text" })
  | (ChunkWithScore<"video_transcript"> & { media_type: "video_transcript" })
  | (ChunkWithScore<"website_qa"> & { media_type: "website_qa" })
  | (ChunkWithScore<"website_experience"> & { media_type: "website_experience" })


export interface Document {
  document_id: string;
  public_path: string;
  original_path: string;
  s3_object_name: string;
  media_name: string;
}
export interface DocumentWithChunks extends Document {
  chunks: DocumentChunk[];
}

export interface DocumentSearchResult {
  document_id: string;
  public_path: string;
  original_path: string;
  media_name: string;
  max_score: number;
  min_score: number;
  chunks: ChunkWithScoreUnion[];
}

// Type guard functions

export const isTextChunk = (chunk: ChunkWithScoreUnion) => {
  return isPdfImageChunk(chunk)
}

export const isPdfImageChunk = (chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"pdf_image"> => {
  return chunk.media_type == "pdf_image";
}

export const isPdfTextChunk = (chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"pdf_text"> => {
  return chunk.media_type === "pdf_text";
}

export function isVideoTranscriptChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"video_transcript"> {
  return chunk.media_type === "video_transcript";
}

export function isWebsiteQAChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"website_qa"> {
  return chunk.media_type === "website_qa";
}

export function isWebsiteExperienceChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"website_experience"> {
  return chunk.media_type === "website_experience";
}
