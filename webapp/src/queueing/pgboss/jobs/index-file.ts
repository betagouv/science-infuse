import { v4 as uuidv4 } from 'uuid'; // Make sure to import the uuid library
import { z } from "zod";
import { defineJob, defineWorker, defineWorkerConfig } from "../boss";
import { apiClient } from "@/lib/api-client";
import axios from "axios";
import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import fs from "fs";
import { Document, DocumentChunk } from "@prisma/client";
import prisma from "@/lib/prisma";

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
  const crypto = require('crypto');
  const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');
  console.log(`File hash: ${fileHash}`);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('author', author || '');

  const result = await axios.post<{ document: Document, chunks: DocumentChunk[] }>(`${NEXT_PUBLIC_SERVER_URL}/process/pdf`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  // Insert document and documentChunks into prisma  
  const createdDocument = await prisma.document.create({
    data: {
      ...result.data.document,
    },
  });

  // TODO: ADD EMBEDDING MODEL TO CHUNKS!!! MIGHT NEED RAW QUERY
  try {
    const documentChunks = await Promise.all(result.data.chunks.map(async ({ document, metadata, id, ...chunk }) => {
      const chunkId = uuidv4(); // Generate a valid UUID

      const createdChunk = await prisma.documentChunk.create({
        data: {
          id: chunkId, // Use the generated UUID
          ...chunk,
          documentId: createdDocument.id,
        },
      });

      if (metadata) {
        await prisma.documentChunkMeta.create({
          data: {
            id: uuidv4(), // Generate a new UUID for metadata
            ...metadata,
            documentChunkId: chunkId,
          },
        });
      }

      return createdChunk;
    }));

    console.log(`Created ${documentChunks.length} document chunks with metadata`);
  } catch (error) {
    console.error("ERROR INDEXING CONTENT", error);
  }


  console.log("-------> RESULT", result.data);

  console.log(`ACTION DONE $src/queueing/pgboss/jobs/index-file.ts with author ${author}`);

  return { success: true, message: 'File indexed successfully', result: result.data, fileHash };
});