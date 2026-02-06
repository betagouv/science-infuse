import { type GenerationSourceScope } from '../components';

/**
 * Discriminated union type for H5P Manager source
 * Used by all H5P editor components (Quiz, Texte à trous, Dialog cards, etc.)
 */
export type H5PManagerSource = 
    | { type: 'document'; documentId: string; scope?: GenerationSourceScope }
    | { type: 'additionalContext'; context: string };

/**
 * Builds API parameters from scope for document-based generation
 */
export const buildParamsFromScope = (params: { documentId: string; scope: GenerationSourceScope }): { documentId?: string; chunkId?: string } => {
    if (params.scope.mode === 'chunk') {
        return { chunkId: params.scope.chunkId };
    }
    return { documentId: params.documentId };
};
