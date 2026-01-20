export type ProcessDirectFilePickedChunk = {
  id: string;
  mediaType: string;
  title?: string;
  text?: string;
  metadata?: any;
};

export type ProcessDirectFileResponse = {
  documentId: string;
  pickedChunk?: ProcessDirectFilePickedChunk;
  alreadyIndexed?: boolean;
};

