type MediaType = "image" | "text" | "videoTranscript";

export interface BaseDocumentChunk<T extends MediaType> {
  text: string;
  media_type: T;
  metadata: MetadataType<T>;
}

export interface VideoTranscriptMetadata {
  video_start_offset: number;
  video_end_offset: number;
}

export interface ImageMetadata {
  public_path: string;
  page_number?: number;
  width: number;
  height: number;
}

export interface TextMetadata {
  text_start_offset: number;
  text_end_offset: number;
}

type MetadataType<T extends MediaType> = 
  T extends "image" ? ImageMetadata :
  T extends "text" ? TextMetadata :
  T extends "videoTranscript" ? VideoTranscriptMetadata :
  never;

export type VideoTranscriptChunk = BaseDocumentChunk<"videoTranscript">;
export type ImageChunk = BaseDocumentChunk<"image">;
export type TextChunk = BaseDocumentChunk<"text">;

export type DocumentChunk = VideoTranscriptChunk | ImageChunk | TextChunk;

export interface ChunkWithScore<T extends MediaType> extends BaseDocumentChunk<T> {
  score: number;
}

export type ChunkWithScoreUnion =
  | (ChunkWithScore<"image"> & { media_type: "image" })
  | (ChunkWithScore<"text"> & { media_type: "text" })
  | (ChunkWithScore<"videoTranscript"> & { media_type: "videoTranscript" });

export function createDocumentChunk(data: any): DocumentChunk {
  const mediaType = data.media_type;
  switch (mediaType) {
    case "image":
      return data as ImageChunk;
    case "text":
      return data as TextChunk;
    case "videoTranscript":
      return data as VideoTranscriptChunk;
    default:
      throw new Error(`Unsupported media_type: ${mediaType}`);
  }
}

export interface Document {
  chunks: DocumentChunk[];
  document_id: string;
  local_path: string;
  original_public_path: string;
  media_name: string;
}

export interface DocumentSearchResult {
  document_id: string;
  local_path: string;
  original_public_path: string;
  media_name: string;
  max_score: number;
  min_score: number;
  chunks: ChunkWithScoreUnion[];
}

// Type guard functions
export function isImageChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"image"> {
  return chunk.media_type === "image";
}

export function isTextChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"text"> {
  return chunk.media_type === "text";
}

export function isVideoTranscriptChunk(chunk: ChunkWithScoreUnion): chunk is ChunkWithScore<"videoTranscript"> {
  return chunk.media_type === "videoTranscript";
}

// Example of how to use these types in a component
interface RenderChunkPreviewProps extends ChunkWithScoreUnion {
  searchWords: string[];
  original_public_path: string;
}

export const RenderChunkPreview: React.FC<RenderChunkPreviewProps> = (props) => {
  const [expanded, setExpanded] = useState(false);

  if (isImageChunk(props)) {
    const { width, height, public_path } = props.metadata;
    // Render image chunk...
  } else if (isTextChunk(props)) {
    const { text_start_offset, text_end_offset } = props.metadata;
    // Render text chunk...
  } else if (isVideoTranscriptChunk(props)) {
    const { video_start_offset, video_end_offset } = props.metadata;
    // Render video transcript chunk...
  }

  // Common rendering logic...
};