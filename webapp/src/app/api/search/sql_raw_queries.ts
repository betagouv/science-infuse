import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma"



export async function searchDocumentChunks(embedding: number[]) {
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
    "text", "title", "mediaType",
    "DocumentChunk"."id" as "id",
    to_json("DocumentChunkMeta".*) "metadata",
    to_json("Document".*) "document",
    1 - ("textEmbedding" <=> ${embedding}::vector) AS score 
  FROM "DocumentChunk" 
  LEFT JOIN "DocumentChunkMeta" ON "DocumentChunk"."id" = "DocumentChunkMeta"."documentChunkId"
  LEFT JOIN "Document" ON "Document"."id" = "DocumentChunk"."documentId"
  -- WHERE "mediaType" = 'pdf_image'
  WHERE 1 - ("textEmbedding" <=> ${embedding}::vector) > 0.21
  ORDER BY score DESC 
  LIMIT 1000
`;
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time: ${executionTime} milliseconds`);

  return data;
}