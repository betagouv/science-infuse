import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma"
import { JSONContent } from '@tiptap/core';
import { QueryRequest } from '@/types/api';

export async function updateBlock(title: string, content: JSONContent, textEmbedding: number[], userId: string, blockId: string, chapterId: string) {
  // if block does not exist (or has been deleted)
  // create one
  const block = await prisma.block.findUnique({
    where: {
      id: blockId,
    },
  });
  if (block && block?.userId != userId) {
    throw new Error("User does not have permission to update this block")
  }
  if (!block) {
    const block = await prisma.block.create({
      data: {
        id: blockId,
        title,
        content,
        chapter: {
          connect: { id: chapterId }
        },
        user: {
          connect: { id: userId },
        },
      },
    });
  }

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


export async function searchBlocksWithChapter(userId: string, embedding: number[]) {
  const startTime = performance.now();
  const data = await prisma.$queryRaw`
  SELECT
    "Block".id,
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
        FROM "_ChapterToEducationLevel"
        JOIN "EducationLevel" ON "EducationLevel".id = "_ChapterToEducationLevel"."B"
        WHERE "_ChapterToEducationLevel"."A" = "Chapter".id
      ),
      'theme', (
        SELECT json_build_object('id', "Theme".id, 'title', "Theme"."title")
        FROM "Theme"
        WHERE "Theme".id = "Chapter"."themeId"
      )
    ) as chapter,
    1 - ("textEmbedding" <=> ${embedding}::vector) as score,
    CASE WHEN "StarredBlock".id IS NOT NULL THEN true ELSE false END as user_starred
FROM "Block"
  LEFT JOIN "Chapter" ON "Chapter"."id" = "Block"."chapterId"
  LEFT JOIN "StarredBlock" ON "StarredBlock"."blockId" = "Block".id AND "StarredBlock"."userId" = ${userId}
  WHERE "status" = 'REVIEW' AND 1 - ("textEmbedding" <=> ${embedding}::vector) > 0.41
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
        AND (d."deleted" IS NOT TRUE)
      ORDER BY dc."textEmbedding" <=> ${embedding}::vector
      LIMIT ${Math.min(params.limit || 1000, 1000)};
      `
  ])

  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time documentChunks: ${executionTime} milliseconds`);

  return data;
}