import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma"
import { QueryRequest } from '@/lib/api-client';



export async function searchDocumentChunks(userId: string, embedding: number[], params: QueryRequest) {
  const startTime = performance.now();


  // // First, get all column names except the vector column
  // const columnsQuery = await prisma.$queryRaw<[{ columns: string }]>`
  //   SELECT string_agg(column_name, ', ') as columns
  //   FROM information_schema.columns
  //   WHERE table_name = 'DocumentChunk'
  //     AND column_name != 'textEmbedding'
  // `;

  // const columns = columnsQuery[0].columns.split(', ')
  //   // .filter(c => c.toLocaleLowerCase() != "documentid")
  //   .filter(c => c != "id")
  //   .map(c => `"${c}"`)
  //   .join(", ");
  // console.log("COLUMNS==========", columns)

  // Now use these columns in the main query
  // ${Prisma.raw(columns)}, // NOTE:, to make dynamic, could replace |"documentId", "text", "title", "mediaType",| with this
  const data = await prisma.$queryRaw`
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
  -- add a threshold, discard results bellow 0.21 score (considered not relevent). Might need to find a sweet spot
  WHERE 1 - ("textEmbedding" <=> ${embedding}::vector) > 0.21
  -- filter by media type if specified in search params
    ${params.mediaTypes ? Prisma.sql`AND "DocumentChunk"."mediaType" = ANY(${params.mediaTypes}::text[])` : Prisma.empty}
  ORDER BY score DESC
  -- limit result to 1000
  LIMIT ${Math.min(params.limit || 1000, 1000)}

`;
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time: ${executionTime} milliseconds`);

  return data;
}