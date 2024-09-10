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