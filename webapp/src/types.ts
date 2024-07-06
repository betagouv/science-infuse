//  this should match schema.py

type MediaType = "pdf_image" | "raw_image" | "pdf_text" | "video_transcript";

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
  public_path: string;
  page_number: number;
  bbox: BoundingBox;
}

export interface PdfTextMetadata {
  page_number: number;
  bbox: BoundingBox;
}

type MetadataType<T extends MediaType> =
  T extends "pdf_image" ? PdfImageMetadata :
  T extends "raw_image" ? RawImageMetadata :
  T extends "pdf_text" ? PdfTextMetadata :
  T extends "video_transcript" ? VideoTranscriptMetadata :
  never;

export type VideoTranscriptChunk = BaseDocumentChunk<"video_transcript">;
export type PdfImageChunk = BaseDocumentChunk<"pdf_image">;
export type RawImageChunk = BaseDocumentChunk<"raw_image">;
export type PdfTextChunk = BaseDocumentChunk<"pdf_text">;

export type DocumentChunk = VideoTranscriptChunk | PdfImageChunk | RawImageChunk | PdfTextChunk;

export interface ChunkWithScore<T extends MediaType> extends BaseDocumentChunk<T> {
  score: number;
}

export type ChunkWithScoreUnion =
  | (ChunkWithScore<"pdf_image"> & { media_type: "pdf_image" })
  | (ChunkWithScore<"raw_image"> & { media_type: "raw_image" })
  | (ChunkWithScore<"pdf_text"> & { media_type: "pdf_text" })
  | (ChunkWithScore<"video_transcript"> & { media_type: "video_transcript" });


export interface Document {
  document_id: string;
  public_path: string;
  original_public_path: string;
  media_name: string;
}
export interface DocumentWithChunks extends Document {
  chunks: DocumentChunk[];
}

export interface DocumentSearchResult {
  document_id: string;
  public_path: string;
  original_public_path: string;
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
