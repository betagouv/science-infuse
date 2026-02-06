import prisma from "@/lib/prisma";
import { DocumentChunk } from "@prisma/client";

export interface AiGenerationParams {
  documentId?: string;
  chunkId?: string;
  additionalContext?: string;
}

export type GetContextParams = AiGenerationParams & {
  maxTextLength?: number;
}

/**
 * Retrieves context text from the database based on documentId or chunkId.
 * 
 * @param {GetContextParams} params - Parameters for retrieving context
 * @param {string} [params.documentId] - The document ID to fetch chunks from
 * @param {string} [params.chunkId] - The specific chunk ID to fetch
 * @param {number} [params.maxTextLength] - Maximum text length to return (default: from LLM_MAX_CONTEXT_LENGTH env or 10000)
 * @returns {Promise<string>} The context text, sliced to maxTextLength if needed
 * @throws {Error} If neither documentId nor chunkId is provided, or if no content is found
 */
export async function getContext(params: GetContextParams): Promise<string> {
  const defaultMaxLength = process.env.LLM_MAX_CONTEXT_LENGTH
    ? parseInt(process.env.LLM_MAX_CONTEXT_LENGTH, 10)
    : 10000;

  const { documentId, chunkId, maxTextLength = defaultMaxLength, additionalContext } = params;

  if (!documentId && !chunkId && !additionalContext) {
    throw new Error("Either documentId, chunkId or additionalContext is required");
  }

  let context = "";

  if (chunkId) {
    // Fetch specific chunk
    const chunk: Pick<DocumentChunk, "text"> | null = await prisma.documentChunk.findUnique({
      where: { id: chunkId },
      select: { text: true },
    });

    if (!chunk) {
      throw new Error(`Chunk with id ${chunkId} not found`);
    }

    context = chunk.text;
  } else if (documentId) {
    // Fetch all chunks for the document
    const chunks: Pick<DocumentChunk, "text">[] = await prisma.documentChunk.findMany({
      where: { documentId },
      select: { text: true },
    });

    if (chunks.length === 0) {
      throw new Error(`No chunks found for document ${documentId}`);
    }

    context = chunks.map((chunk) => chunk.text).join("\n\n");
  }

  context += additionalContext

  // Slice the context to maxTextLength if it exceeds the limit
  if (context.length > maxTextLength) {
    context = context.slice(0, maxTextLength);
  }

  if (!context.trim()) {
    throw new Error("No content found");
  }


  return context;
}
