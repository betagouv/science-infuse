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
import indexYoutube, { createOrGetTag } from "../index-video";

const crypto = require('crypto');

const config = defineWorkerConfig({
  name: "data.auto-index-youtube",
  schema: z.object({
    url: z.string(),
    sourceCreationDate: z.date().optional(),
    documentTagIds: z.array(z.string()),
    fileHash: z.string(),
    metadata: z.object({
      channelName: z.string().optional(),
    }).optional(),
  }),
});

export interface ServerProcessingResult {
  document: Document;
  chunks: (DocumentChunk & { document: any, metadata: any })[];
}


export const autoIndexYoutubeJob = defineJob(config);

export const autoIndexYoutubeWorker = defineWorker(config, async (job) => {
  const { url, documentTagIds, sourceCreationDate, metadata, fileHash } = job.data;


  const [processingError, processingResponse] = await catchErrorTyped(
    indexYoutube({
      youtubeUrl: url,
      isExternal: false,
      channelName: metadata?.channelName,
      documentTagIds,
      sourceCreationDate,
    }),
    [Error]
  )

  // if everything goes well, we got the response from the server with the processed document and it's chunks
  // so we insert it into db
  
  if (processingResponse) {
    const documentId = await insertDocument({
      document: processingResponse.document,
      chunks: processingResponse.chunks,
      hash: fileHash,
      isExternal: false,
      documentTagIds: documentTagIds,
      sourceCreationDate,
    })
    return { success: true, message: 'Fichier indexé avec succès', documentId, fileHash };
  }
});