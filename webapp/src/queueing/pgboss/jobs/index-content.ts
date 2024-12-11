import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { catchErrorTyped } from "@/errors";
import { insertDocument } from "@/lib/utils/db";
import { Document, DocumentChunk } from "@prisma/client";
import axios from "axios";
import fs from "fs";
import { z } from "zod";
import { defineJob, defineWorker, defineWorkerConfig } from "../boss";
import { IndexingContentType } from "@/types/queueing";

const crypto = require('crypto');

const config = defineWorkerConfig({
  name: "data.index-content",
  schema: z.object({
    path: z.string(),
    type: z.nativeEnum(IndexingContentType),
    documentTagIds: z.array(z.string()),
    author: z.string().optional(),
  }),
});
interface ProcessResult {
  document: Document;
  chunks: (DocumentChunk & { document: any, metadata: any })[];
}


export const indexContentJob = defineJob(config);

export const indexContentWorker = defineWorker(config, async (job) => {
  const { path, author, type, documentTagIds } = job.data;

  let processingError: Error | undefined;
  let processingResponse: ProcessResult | undefined;
  let fileHash: string | undefined;

  if (type == IndexingContentType.file) {
    const fileContent = await fs.promises.readFile(path);
    const mimeType: string = require('mime-types').lookup(path) || 'application/octet-stream';
    const file = new File([fileContent], path.split('/').pop() || 'unknown', { type: mimeType });
    // Calculate the hash of the file
    fileHash = crypto.createHash('sha256').update(fileContent).digest('hex');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('author', author || '');


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

    await fs.promises.unlink(path);


  }
  else if (type == IndexingContentType.url) {
    fileHash = path;
    [processingError, processingResponse] = await catchErrorTyped(
      axios.post<ProcessResult>(`${NEXT_PUBLIC_SERVER_URL}/process/url`, { url: path }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.data),
      [Error]
    )
  }
  else if (type == IndexingContentType.youtube) {
    fileHash = path;
    [processingError, processingResponse] = await catchErrorTyped(
      axios.post<ProcessResult>(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { url: path }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.data),
      [Error]
    )
  }

  if (processingError)
    return { success: false, message: `Error indexing file error: ${processingError}`, fileHash };

  if (!processingResponse)
    return { success: false, message: `Error indexing file the processing server returned an empty response`, fileHash };

  const documentId = await insertDocument(processingResponse.document, processingResponse.chunks, documentTagIds, fileHash)

  return { success: true, message: 'Fichier indexé avec succès', documentId, fileHash };
});