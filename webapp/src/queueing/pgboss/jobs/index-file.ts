import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import prisma from "@/lib/prisma";
import { getEmbeddings } from '@/lib/utils/getEmbeddings';
import { Document, DocumentChunk } from "@prisma/client";
import axios from "axios";
import fs from "fs";
import { v4 as uuidv4 } from 'uuid'; // Make sure to import the uuid library
import { z } from "zod";
import { defineJob, defineWorker, defineWorkerConfig } from "../boss";
const crypto = require('crypto');

const config = defineWorkerConfig({
  name: "data.index-file",
  schema: z.object({
    filePath: z.string(),
    author: z.string().optional(),
  }),
});

export const indexFileJob = defineJob(config);

export const indexFileWorker = defineWorker(config, async (job) => {
  const { filePath, author } = job.data;

  console.log(`REGISTERING ACTION TO DO $src/queueing/pgboss/jobs/index-file.ts with author ${author}`);

  const fileContent = await fs.promises.readFile(filePath);
  const file = new File([fileContent], filePath.split('/').pop() || 'unknown', { type: 'application/octet-stream' });
  console.log(`Created File object: ${file.name}`);

  // Calculate the hash of the file
  const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
  console.log(`File hash: ${fileHash}`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('author', author || '');

  const result = await axios.post<{ document: Document, chunks: (DocumentChunk & { document: any, metadata: any })[] }>(`${NEXT_PUBLIC_SERVER_URL}/process/pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  try {
    // create new document
    const createdDocument = await prisma.document.create({
      data: {
        ...result.data.document,
        fileHash: fileHash,
      },
    });

    // create chunks (and  metadatas) and link them to the new document
    await Promise.all(result.data.chunks.map(async ({ document, metadata, id, ...chunk }) => {
      const chunkId = uuidv4();
      const textEmbedding = await getEmbeddings(chunk.text);
      // insert using queryRaw since vector is unsupported as a type.
      await prisma.$queryRaw`
      INSERT INTO "DocumentChunk" (
        id, text, "textEmbedding", test, title, "mediaType", "documentId"
      ) VALUES (
        ${chunkId}::uuid, 
        ${chunk.text}, 
        ${textEmbedding}::vector, 
        ${chunk.test || 'test'}, 
        ${chunk.title}, 
        ${chunk.mediaType}, 
        ${createdDocument.id}::uuid
      )
    `;

      if (metadata) {
        await prisma.documentChunkMeta.create({
          data: {
            id: uuidv4(),
            ...metadata,
            documentChunkId: chunkId,
          },
        });
      }

    }));

    await fs.promises.unlink(filePath);
    

    return { success: true, message: 'File indexed successfully', documentId: createdDocument.id, fileHash };
  } catch (error) {
    console.error("ERROR INDEXING CONTENT", error);
  }
});