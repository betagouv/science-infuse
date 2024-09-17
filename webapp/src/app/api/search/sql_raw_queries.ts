import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma"
import { QueryRequest } from '@/lib/api-client';
import { JSONContent } from '@tiptap/core';

export async function updateBlock(title: string, content: JSONContent, textEmbedding: number[], userId: string, blockId: string) {
  const updatedBlock = await prisma.$queryRaw`
  UPDATE "Block"
  SET 
    "title" = ${title},
    "content" = ${JSON.stringify(content)}::jsonb,
    "textEmbedding" = ${textEmbedding},
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE 
    "id" = ${blockId} AND "userId" = ${userId};
    `;
  return updatedBlock;
}


export async function searchChapters(embedding: number[]) {
  const startTime = performance.now();
  const data = await prisma.$queryRaw`
  SELECT
  "Block".title,
  to_json("Chapter".*) as "chapter",
  1 - ("textEmbedding" <=> ${embedding}::vector) as score
  FROM "Block"
  LEFT JOIN "Chapter" ON "Chapter"."id" = "Block"."chapterId"
  WHERE 1 - ("textEmbedding" <=> ${embedding}::vector) > 0.21
  ORDER BY score DESC
  LIMIT 100
`;
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time: ${executionTime} milliseconds`);

  return data;
}
export async function searchDocumentChunks(userId: string, embedding: number[], params: QueryRequest) {
  const startTime = performance.now();
  const data = await prisma.$queryRaw`
WITH ranked_chunks AS (
  SELECT
    "DocumentChunk"."text",
    "DocumentChunk"."title",
    "DocumentChunk"."mediaType",
    "DocumentChunk"."id" as "id",
    to_json("DocumentChunkMeta".*) as "metadata",
    to_json("Document".*) as "document",
    1 - ("textEmbedding" <=> ${embedding}::vector) as score,
    CASE 
      WHEN "StarredDocumentChunk"."id" IS NOT NULL THEN true 
      ELSE false 
    END as "user_starred"
  FROM "DocumentChunk"
  LEFT JOIN "DocumentChunkMeta" ON "DocumentChunk"."id" = "DocumentChunkMeta"."documentChunkId"
  LEFT JOIN "Document" ON "Document"."id" = "DocumentChunk"."documentId"
  LEFT JOIN "StarredDocumentChunk" 
    ON "DocumentChunk"."id" = "StarredDocumentChunk"."documentChunkId"
    AND "StarredDocumentChunk"."userId" = ${userId}
  WHERE "textEmbedding" IS NOT NULL
    ${params.mediaTypes ? Prisma.sql`AND "DocumentChunk"."mediaType" = ANY(${params.mediaTypes}::text[])` : Prisma.empty}
)
SELECT *
FROM ranked_chunks
WHERE score > 0.21
ORDER BY score DESC
LIMIT ${Math.min(params.limit || 1000, 1000)}
`;
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time: ${executionTime} milliseconds`);

  return data;
}