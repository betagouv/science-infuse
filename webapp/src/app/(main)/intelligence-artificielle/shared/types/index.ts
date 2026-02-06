// Shared types for interactive content generators

export * from './h5p-manager';

import { ChunkWithScoreUnion, MediaTypes } from "@/types/vectordb";
import { TabType } from "@/app/(main)/recherche/Tabs";

export interface DocumentPickerProps {
    onChunkPicked: (chunk: ChunkWithScoreUnion) => void;
    onDocumentProcessingStart: () => void;
    onError: (message: string) => void;
}

export interface ContentGeneratorCallbacks {
    onChunkPicked: (chunk: ChunkWithScoreUnion) => void;
    onError: (message: string) => void;
    onDocumentProcessingStart: () => void;
    onDocumentProcessingEnd: () => void;
}

export interface SearchPickerConfig {
    searchBarLabel?: string;
    searchBarPlaceholder?: string;
    onInsertedLabel?: string;
    mediaTypes?: MediaTypes[];
    hiddenTabs?: TabType[];
    defaultTab?: string;
    queryFilters?: {
        limit?: number;
        mediaTypes?: MediaTypes[];
        maxDuration?: number;
    };
}

export interface GenericDocumentPickerProps extends DocumentPickerProps {
    config?: SearchPickerConfig;
}