import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { catchErrorTyped } from "@/errors";
import { insertDocument } from "@/lib/utils/db";
import { Document, DocumentChunk } from "@prisma/client";
import axios from "axios";
import fs from "fs";
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

  const fileContent = await fs.promises.readFile(filePath);
  const file = new File([fileContent], filePath.split('/').pop() || 'unknown', { type: 'application/octet-stream' });

  // Calculate the hash of the file
  const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('author', author || '');

  // const result = await axios.post<{ document: Document, chunks: (DocumentChunk & { document: any, metadata: any })[] }>(`${NEXT_PUBLIC_SERVER_URL}/process/pdf`, formData, {
  //   headers: {
  //     'Content-Type': 'multipart/form-data',
  //   },
  // });
  const [error, result] = await catchErrorTyped(
    axios.post<{ document: Document, chunks: (DocumentChunk & { document: any, metadata: any })[] }>(`${NEXT_PUBLIC_SERVER_URL}/process/pdf`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
    [Error]
  )

  await fs.promises.unlink(filePath);

  if (error)
    return { success: false, message: 'Error indexing file', fileHash };

  const documentId = await insertDocument(result.data.document, result.data.chunks, fileHash)

  return { success: true, message: 'File indexed successfully', documentId, fileHash };

});