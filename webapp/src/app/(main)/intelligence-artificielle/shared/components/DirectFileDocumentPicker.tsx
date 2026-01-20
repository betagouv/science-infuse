"use client";

import { apiClient } from "@/lib/api-client";
import type { ProcessDirectFilePickedChunk } from "@/types/api/direct-file";
import { ChunkWithScoreUnion } from "@/types/vectordb";
import { DocumentPickerProps } from "../types";
import { Accept } from "react-dropzone";
import FileUploadPicker from "./FileUploadPicker";

type Props = DocumentPickerProps & {
  accept: Accept;
  hintText?: string;
  submitLabel: string;

  /**
   * When true, the API must return a real DB `chunkId` (used e.g. by ImageACompleter).
   * When false, we only need the `documentId` and we can pass a minimal chunk.
   */
  returnPickedChunk?: boolean;
  pickChunkMediaType?: string;
};

export default function DirectFileDocumentPicker(props: Props) {
  return (
    <FileUploadPicker
      accept={props.accept}
      hintText={props.hintText}
      submitLabel={props.submitLabel}
      titleInputLabel="Titre du document"
      onSubmit={async (file, mediaName) => {
        try {
          props.onDocumentProcessingStart();

          const response = await apiClient.processDirectFile({
            file,
            mediaName,
            pickMediaType: props.returnPickedChunk ? props.pickChunkMediaType : undefined,
          });

          // Some generators only need the documentId.
          if (!props.returnPickedChunk) {
            // Keep it consistent with existing patterns (see ExternalVideoPicker).
            // @ts-ignore
            props.onChunkPicked({ document: { id: response.documentId } });
            return;
          }

          if (!response.pickedChunk) {
            throw new Error("Aucun contenu exploitable n'a été détecté dans ce fichier.");
          }

          const picked = response.pickedChunk as ProcessDirectFilePickedChunk;
          const pickedChunk = {
            ...picked,
            score: 0,
            document: { id: response.documentId },
          } as unknown as ChunkWithScoreUnion;

          props.onChunkPicked(pickedChunk);
        } catch (error) {
          if (error instanceof Error) {
            props.onError(error.message);
          } else {
            props.onError("Une erreur inconnue s'est produite");
          }
        }
      }}
    />
  );
}
