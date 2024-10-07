import { BlockWithChapter, ChunkWithScoreUnion } from "@/types/vectordb";
import { Block, DocumentChunk } from "@prisma/client";

// TOC
export interface TOCItem {
    text: string;
    page: number;
    items?: TOCItem[];
}

export interface TableOfContents {
    items: TOCItem[];
}

export interface ChunkData {
    title: string;
    page: number;
}


export type GroupedFavorites = {
    [keyword: string]: { documentChunks: ChunkWithScoreUnion[], blocks: BlockWithChapter[] };
  };
  