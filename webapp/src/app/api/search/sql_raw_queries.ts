import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma"
import { QueryRequest } from '@/lib/api-client';
import { JSONContent } from '@tiptap/core';

export async function updateBlock(title: string, content: JSONContent, textEmbedding: number[], userId: string, blockId: string) {
  const updatedBlock = await prisma.$queryRaw`
  UPDATE "Block"
  SET 
    "title" = ${title},
    "content" = ${content}::jsonb,
    "textEmbedding" = ${textEmbedding},
    "updatedAt" = CURRENT_TIMESTAMP
  WHERE 
    "id" = ${blockId} AND "userId" = ${userId};
    `;
  return updatedBlock;
}


export async function searchBlocksWithChapter(embedding: number[]) {
  const startTime = performance.now();
  const data = await prisma.$queryRaw`
  SELECT
    "Block".title,
    "Block".content,
    json_build_object(
      'id', "Chapter".id,
      'status', "Chapter"."status",
      'title', "Chapter"."title",
      'content', "Chapter"."content",
      'coverPath', "Chapter"."coverPath",
      'userId', "Chapter"."userId",
      'createdAt', "Chapter"."createdAt",
      'updatedAt', "Chapter"."updatedAt",
      'educationLevels', (
        SELECT json_agg(json_build_object('id', "EducationLevel".id, 'name', "EducationLevel".name))
        FROM "EducationLevel"
        WHERE "EducationLevel"."chapterId" = "Chapter".id
      ),
      'theme', (
        SELECT json_build_object('id', "Theme".id, 'title', "Theme"."title")
        FROM "Theme"
        WHERE "Theme".id = "Chapter"."themeId"
      )
    ) as chapter,
    1 - ("textEmbedding" <=> ${embedding}::vector) as score
  FROM "Block"
  LEFT JOIN "Chapter" ON "Chapter"."id" = "Block"."chapterId"
  WHERE 1 - ("textEmbedding" <=> ${embedding}::vector) > 0.41
  ORDER BY score DESC
  LIMIT 100
`;
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time chapters: ${executionTime} milliseconds`);

  return data;
}
export async function searchDocumentChunks(userId: string, embedding: number[], params: QueryRequest) {
  const limit = Math.min(params.limit || 1000, 1000);
  const startTime = performance.now();
  const [_, data] = await prisma.$transaction([
    prisma.$executeRaw`SET LOCAL hnsw.ef_search = 1000`,
    prisma.$queryRaw`
      SELECT
        dc."text",
        dc."title",
        dc."mediaType",
        dc."id",
        to_json(dcm.*) as "metadata",
        to_json(d.*) as "document",
        1 - (dc."textEmbedding" <=> ${embedding}::vector) as score,
        CASE 
          WHEN sdc."id" IS NOT NULL THEN true 
          ELSE false 
        END as "user_starred"
      FROM "DocumentChunk" dc
      LEFT JOIN "DocumentChunkMeta" dcm ON dc."id" = dcm."documentChunkId"
      LEFT JOIN "Document" d ON d."id" = dc."documentId"
      LEFT JOIN "StarredDocumentChunk" sdc
        ON dc."id" = sdc."documentChunkId" AND sdc."userId" = ${userId}
      WHERE dc."textEmbedding" IS NOT NULL
        ${params.mediaTypes ? Prisma.sql`AND dc."mediaType" = ANY(${params.mediaTypes}::text[])` : Prisma.empty}
        AND 1 - (dc."textEmbedding" <=> ${embedding}::vector) > 0.21
      ORDER BY dc."textEmbedding" <=> ${embedding}::vector
      LIMIT ${Math.min(params.limit || 1000, 1000)};
      `
  ])

  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time documentChunks: ${executionTime} milliseconds`);

  return data;
}