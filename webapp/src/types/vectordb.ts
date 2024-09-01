import { User } from "@prisma/client";

//  this should match schema.py
export const MediaTypes = {
  PdfImage: "pdf_image",
  RawImage: "raw_image",
  PdfText: "pdf_text",
  VideoTranscript: "video_transcript",
  WebsiteQa: "website_qa",
  WebsiteExperience: "website_experience",
} as const;

export type MediaType = typeof MediaTypes[keyof typeof MediaTypes];

export const availableMediaTypes = Object.values(MediaTypes);

export interface BoundingBox {
  x1: number
  y1: number
  x2: number
  y2: number
}
export interface BaseDocumentChunk<T extends MediaType> {
  id: string;
  text: string;
  title: string;
  document: Document,
  mediaType: T;
  user_starred?: boolean;
  metadata: MetadataType<T>;
}

export interface VideoTranscriptMetadata {
  start: number;
  end: number;
}

export interface RawImageMetadata {
  publicPath: string;
}

export interface PdfImageMetadata {
  s3ObjectName: string;
  pageNumber: number;
  bbox: BoundingBox;
}

export interface PdfTextMetadata {
  pageNumber: number;
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
  | (ChunkWithScore<"pdf_image"> & { mediaType: "pdf_image" })
  | (ChunkWithScore<"raw_image"> & { mediaType: "raw_image" })
  | (ChunkWithScore<"pdf_text"> & { mediaType: "pdf_text" })
  | (ChunkWithScore<"video_transcript"> & { mediaType: "video_transcript" })
  | (ChunkWithScore<"website_qa"> & { mediaType: "website_qa" })
  | (ChunkWithScore<"website_experience"> & { mediaType: "website_experience" })


export interface Document {
  id: string;
  documentId: string;
  publicPath: string;
  originalPath: string;
  s3ObjectName: string;
  user_approved?: boolean;
  user_disapproved?: boolean;
  mediaName: string;
}
export interface DocumentWithChunks extends Document {
  chunks: DocumentChunk[];
}

export interface DocumentSearchResult {
  id: string;
  documentId: string;
  publicPath: string;
  originalPath: string;
  mediaName: string;
  max_score: number;
  min_score: number;
  chunks: ChunkWithScoreUnion[];
}

export interface DocumentSearchResults {
  documents: DocumentSearchResult[],
  page_count: number,
}

export interface ChunkSearchResults {
  chunks: ChunkWithScoreUnion[],
  page_count: number,
}

export interface ChunkSearchResultsWithType<CustomType extends MediaType> {
  chunks: ChunkWithScore<CustomType>[],
  page_count: number,
}



// Type guard functions

export const isTextChunk = (chunk: ChunkWithScoreUnion) => {
  return isPdfImageChunk(chunk)
}

export const isPdfImageChunk = (chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"pdf_image"> => {
  return chunk.mediaType == "pdf_image";
}

export const isPdfTextChunk = (chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"pdf_text"> => {
  return chunk.mediaType === "pdf_text";
}

export function isVideoTranscriptChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"video_transcript"> {
  return chunk.mediaType === "video_transcript";
}

export function isWebsiteQAChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"website_qa"> {
  return chunk.mediaType === "website_qa";
}

export function isWebsiteExperienceChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"website_experience"> {
  return chunk.mediaType === "website_experience";
}
