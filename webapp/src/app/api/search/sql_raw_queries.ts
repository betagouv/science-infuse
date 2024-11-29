import { Block, Prisma } from '@prisma/client'
import prisma from "@/lib/prisma"
import { JSONContent } from '@tiptap/core';
import { QueryRequest } from '@/types/api';
import axios from 'axios';
import { NEXT_PUBLIC_SERVER_URL } from '@/config';
import { extractTextFromTipTap } from '@/lib/utils';

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



interface RerankResponse {
  text: string;
  score: number;
}

interface BlockWithScore extends Block {
  extractedContent?: string;
  score: number;
  chapter: any; // Replace with proper chapter type
  user_starred: boolean;
}

export async function searchBlocksWithChapter(
  userId: string,
  embedding: number[],
  query: string,
  rerank: boolean = false,
  threshold: number = 0.41,
  reranker_threshold: number = 0.15,
): Promise<BlockWithScore[]> {
  const startTime = performance.now();

  const data: BlockWithScore[] = await prisma.$queryRaw`
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
    WHERE "status" = 'PUBLISHED' AND 1 - ("textEmbedding" <=> ${embedding}::vector) > ${threshold}
    ORDER BY score DESC
    LIMIT 100`;

  const queryTime = performance.now() - startTime;
  console.log(`Initial query execution time: ${queryTime}ms`);

  if (!rerank) {
    return data;
  }

  // Extract text content once for all blocks
  // TODO: might need to oprimise if number of chapters get's huge : ie: store chapter raw text at save time
  const blocksWithContent = data.map(block => ({
    ...block,
    extractedContent: `${block.chapter.title} ${block.title} ${extractTextFromTipTap(block.content)}`
  }));

  // Reranking logic
  try {
    const response = await axios.post<RerankResponse[]>(`${NEXT_PUBLIC_SERVER_URL}/rerank/text`, {
      texts: blocksWithContent.map(block => block.extractedContent!),
      query
    });

    // Create a Map for O(1) lookup of scores
    const scoreMap = new Map(
      response.data.map(item => [item.text, item.score])
    );

    // Sort using the score map
    const rerankResult = [...blocksWithContent].sort((a, b) => {
      const scoreA = scoreMap.get(a.extractedContent) ?? 0;
      const scoreB = scoreMap.get(b.extractedContent) ?? 0;
      return scoreB - scoreA;
    });


    // Clean up the extracted content before returning
    return rerankResult
      .map(({ extractedContent, ...block }) => ({ ...block, score: scoreMap.get(extractedContent) ?? 0 }))
      .filter(block => block.score >= reranker_threshold)
  } catch (error) {
    console.error('Reranking failed:', error);
    return data; // Fallback to vector similarity results if reranking fails
  }
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
        ${userId ? Prisma.sql`CASE 
          WHEN sdc."id" IS NOT NULL THEN true 
          ELSE false 
        END` : Prisma.sql`false`} as "user_starred"
      FROM "DocumentChunk" dc
      LEFT JOIN "DocumentChunkMeta" dcm ON dc."id" = dcm."documentChunkId"
      LEFT JOIN "Document" d ON d."id" = dc."documentId"
      ${userId ? Prisma.sql`LEFT JOIN "StarredDocumentChunk" sdc
        ON dc."id" = sdc."documentChunkId" AND sdc."userId" = ${userId}` : Prisma.sql``}
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