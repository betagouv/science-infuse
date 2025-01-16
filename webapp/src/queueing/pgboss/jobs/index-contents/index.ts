import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { catchErrorTyped } from "@/errors";
import { insertDocument } from "@/lib/utils/db";
import { Document, DocumentChunk } from "@prisma/client";
import axios from "axios";
import fs from "fs";
import { z } from "zod";
import { defineJob, defineWorker, defineWorkerConfig } from "../../boss";
import { IndexingContentType } from "@/types/queueing";
import { extractYoutubeVideoId } from "@/lib/utils/youtube";
import indexYoutube from "./index-youtube";

const crypto = require('crypto');

const config = defineWorkerConfig({
  name: "data.index-content",
  schema: z.object({
    path: z.string(),
    sourceCreationDate: z.date().optional(),
    type: z.nativeEnum(IndexingContentType),
    documentTagIds: z.array(z.string()),
    author: z.string().optional(),
    metadata: z.object({
      channelName: z.string().optional(),
    }).optional(),
  }),
});

export interface ServerProcessingResult {
  document: Document;
  chunks: (DocumentChunk & { document: any, metadata: any })[];
}


export const indexContentJob = defineJob(config);

export const indexContentWorker = defineWorker(config, async (job) => {
  const { path, author, type, documentTagIds, sourceCreationDate, metadata } = job.data;

  let processingError: Error | undefined;
  let processingResponse: ServerProcessingResult | undefined;
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
          axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/pdf`, formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }).then(response => response.data),
          [Error]
        )
        break;
      case "image/jpeg":
      case "image/png":
        [processingError, processingResponse] = await catchErrorTyped(
          axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/picture`, formData, {
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
      axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/url`, { url: path }, {
        headers: {
          'Content-Type': 'application/json',
        },
      }).then(response => response.data),
      [Error]
    )
  }
  else if (type == IndexingContentType.youtube) {
    return await indexYoutube({
      youtubeUrl: path,
      channelName: metadata?.channelName,
      documentTagIds,
      sourceCreationDate,
    })
  }

  // if (processingError) 
  //   throw processingError;

  // if (!processingResponse)
  //   throw new Error("Error indexing file the processing server returned an empty response");

  // if everything goes well, we got the response from the server with the processed document and it's chunks
  // so we insert it into db

});