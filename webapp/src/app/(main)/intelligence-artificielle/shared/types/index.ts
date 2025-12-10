// Shared types for interactive content generators

import { MediaTypes } from "@/types/vectordb";
import { TabType } from "@/app/(main)/recherche/Tabs";

export interface DocumentPickerProps {
    onDocumentIdPicked: (documentId: string) => void;
    onDocumentProcessingStart: () => void;
    onError: (message: string) => void;
}

export interface ContentGeneratorCallbacks {
    onDocumentIdPicked: (documentId: string) => void;
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