import { Prisma } from '@prisma/client'
import prisma from "@/lib/prisma"



export async function searchDocumentChunks(embedding: number[]) {
  const startTime = performance.now();


  // // First, get all column names except the vector column
  // const columnsQuery = await prisma.$queryRaw<[{ columns: string }]>`
  //   SELECT string_agg(column_name, ', ') as columns
  //   FROM information_schema.columns
  //   WHERE table_name = 'DocumentChunk'
  //     AND column_name != 'text_embedding'
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
    "text", "title", "media_type",
    "DocumentChunk"."id" as "id",
    to_json("DocumentChunkMeta".*) "metadata",
    to_json("Document".*) "document",
    1 - (text_embedding <=> ${embedding}::vector) AS score 
  FROM "DocumentChunk" 
  LEFT JOIN "DocumentChunkMeta" ON "DocumentChunk"."id" = "DocumentChunkMeta"."document_chunk_id"
  LEFT JOIN "Document" ON "Document"."id" = "DocumentChunk"."document_id"
  -- WHERE "media_type" = 'pdf_image'
  WHERE 1 - (text_embedding <=> ${embedding}::vector) > 0.21
  ORDER BY score DESC 
  LIMIT 1000
`;
  const endTime = performance.now();
  const executionTime = endTime - startTime;
  console.log(`Execution time: ${executionTime} milliseconds`);

  return data;
}