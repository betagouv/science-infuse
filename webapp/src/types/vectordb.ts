import { H5P_PUBLIC_URL, WEBAPP_URL } from "@/config";
import { Chapter, EducationLevel, Skill, Theme, User, Document, DocumentTag } from "@prisma/client";
import { JSONContent } from "@tiptap/core";

//  this should match schema.py
export const MediaTypes = {
  Image: "image",
  PdfImage: "pdf_image",
  RawImage: "raw_image",
  PdfText: "pdf_text",
  VideoTranscript: "video_transcript",
  Website: "website",
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

export interface WordSegment {
  start: number,
  end: number, 
  text: string,
}
export interface VideoTranscriptMetadata {
  start: number;
  end: number;
  word_segments: string;
}

export interface RawImageMetadata {
  publicPath: string;
}

export interface PdfImageMetadata {
  s3ObjectName: string;
  pageNumber: number;
  bbox: BoundingBox;
}

export interface ImageMetadata {
  s3ObjectName: string;
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

export interface WebsiteMetadata {
  url: string;
}

export interface WebsiteExperienceMetadata {
  description: string;
  title: string;
  type: string;
  url: string;
}



export type MetadataType<T extends MediaType> =
  T extends "image" ? ImageMetadata :
  T extends "pdf_image" ? PdfImageMetadata :
  T extends "raw_image" ? RawImageMetadata :
  T extends "pdf_text" ? PdfTextMetadata :
  T extends "video_transcript" ? VideoTranscriptMetadata :
  T extends "website_qa" ? WebsiteQAMetadata :
  T extends "website" ? WebsiteMetadata :
  T extends "website_experience" ? WebsiteExperienceMetadata :
  never;

export type VideoTranscriptChunk = BaseDocumentChunk<"video_transcript">;
export type PdfImageChunk = BaseDocumentChunk<"pdf_image">;
export type ImageChunk = BaseDocumentChunk<"image">;
export type RawImageChunk = BaseDocumentChunk<"raw_image">;
export type PdfTextChunk = BaseDocumentChunk<"pdf_text">;
export type WebsiteQAChunk = BaseDocumentChunk<"website_qa">;
export type WebsiteChunk = BaseDocumentChunk<"website">;
export type WebsiteExperienceChunk = BaseDocumentChunk<"website_experience">;

export type DocumentChunk = VideoTranscriptChunk | PdfImageChunk | RawImageChunk | PdfTextChunk | WebsiteQAChunk | WebsiteChunk;

export interface ChunkWithScore<T extends MediaType> extends BaseDocumentChunk<T> {
  score: number;
}

// video_transcript chunks grouped by document
export interface GroupedVideo {
  documentId: string;
  items: ChunkWithScore<"video_transcript">[];
  maxScore: number;
}[]


export type ChunkWithScoreUnion =
  | (ChunkWithScore<"image"> & { mediaType: "image" })
  | (ChunkWithScore<"pdf_image"> & { mediaType: "pdf_image" })
  | (ChunkWithScore<"raw_image"> & { mediaType: "raw_image" })
  | (ChunkWithScore<"pdf_text"> & { mediaType: "pdf_text" })
  | (ChunkWithScore<"video_transcript"> & { mediaType: "video_transcript" })
  | (ChunkWithScore<"website_qa"> & { mediaType: "website_qa" })
  | (ChunkWithScore<"website"> & { mediaType: "website" })
  | (ChunkWithScore<"website_experience"> & { mediaType: "website_experience" })


// export interface Document {
//   id: string;
//   documentId: string;
//   publicPath: string;
//   originalPath: string;
//   s3ObjectName: string;
//   user_approved?: boolean;
//   user_disapproved?: boolean;
//   mediaName: string;
// }

interface DocumentFull extends Document {
  tags: DocumentTag[]
}
export interface DocumentWithChunks extends DocumentFull {
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

export interface ChapterFromBlockFull extends Chapter {
  educationLevels: EducationLevel[],
  skills: Skill[],
  theme?: Theme,
}


export type BlockWithChapter = {
  id: string,
  user_starred: boolean,
  title: string,
  score: number,
  content: JSONContent[],
  chapter: ChapterFromBlockFull
}

export interface SearchResults {
  chunks: ChunkWithScoreUnion[],
  blocks: BlockWithChapter[],
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

export const isImageChunk = (chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"image"> => {
  return chunk.mediaType == "image";
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

export function isWebsiteChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"website"> {
  return chunk.mediaType === "website";
}

export function isWebsiteExperienceChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"website_experience"> {
  return chunk.mediaType === "website_experience";
}


export const s3ToPublicUrl = (s3ObjectName: string | null | undefined) => `${WEBAPP_URL}/api/s3/presigned_url/object_name/${s3ObjectName}`
export const h5pIdToPublicUrl = (h5pContentId: string, s3ObjectName: string) => `${WEBAPP_URL}/embed/h5p/${h5pContentId}`