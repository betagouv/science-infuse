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

interface ProcessResult {
  document: Document;
  chunks: (DocumentChunk & { document: any, metadata: any })[];
}


export const indexFileJob = defineJob(config);

export const indexFileWorker = defineWorker(config, async (job) => {
  const { filePath, author } = job.data;

  const fileContent = await fs.promises.readFile(filePath);
  const mimeType: string = require('mime-types').lookup(filePath) || 'application/octet-stream';
  const file = new File([fileContent], filePath.split('/').pop() || 'unknown', { type: mimeType });
  // Calculate the hash of the file
  const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('author', author || '');

  let processingError: Error | undefined;
  let processingResponse: ProcessResult | undefined;

  switch (mimeType) {
    case "application/pdf":
      [processingError, processingResponse] = await catchErrorTyped(
        axios.post<ProcessResult>(`${NEXT_PUBLIC_SERVER_URL}/process/pdf`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(response => response.data),
        [Error]
      )
    case "image/jpeg":
    case "image/png":
      [processingError, processingResponse] = await catchErrorTyped(
        axios.post<ProcessResult>(`${NEXT_PUBLIC_SERVER_URL}/process/picture`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }).then(response => response.data),
        [Error]
      )
      break;
    default:
      return { success: false, message: `Cannot process mimeType "${mimeType}".` };
  }

  await fs.promises.unlink(filePath);

  if (processingError)
    return { success: false, message: `Error indexing file error: ${processingError}`, fileHash };

  if (!processingResponse)
    return { success: false, message: `Error indexing file the processing server returned an empty response`, fileHash };

  const documentId = await insertDocument(processingResponse.document, processingResponse.chunks, fileHash)

  return { success: true, message: 'File indexed successfully', documentId, fileHash };

});