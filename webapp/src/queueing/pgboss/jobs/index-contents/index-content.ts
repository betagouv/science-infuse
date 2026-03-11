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
import s3Storage from "@/app/api/S3Storage";
import { v4 as uuidv4 } from "uuid";

const crypto = require('crypto');

const config = defineWorkerConfig({
  name: "data.index-content",
  schema: z.object({
    path: z.string(),
    sourceCreationDate: z.date().optional(),
    type: z.nativeEnum(IndexingContentType),
    documentTagIds: z.array(z.string()),
    author: z.string().optional(),
    isExternal: z.boolean(),
    title: z.string().optional().nullable(),
    credit: z.string().optional().nullable(),
    isDownloadable: z.boolean().optional(),
    identifier: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    youtubeId: z.string().optional().nullable(),
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

export const IndexContentWorker = defineWorker(config, async (job) => {
  const { path, author, type, documentTagIds, sourceCreationDate, metadata, isExternal, title, credit, isDownloadable, identifier, description, youtubeId } = job.data;

  let processingError: Error | undefined;
  let processingResponse: ServerProcessingResult | undefined;
  let fileHash: string | undefined;
  let tags = [...documentTagIds]

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
      case "video/mp4":
      case "video/webm":
      case "video/quicktime":
      case "video/x-msvideo":
      case "video/x-matroska":
      case "video/ogg":
        // Videos need to be uploaded to S3 first, then processed
        const fileExtension = path.split('.').pop() || 'mp4';
        const s3ObjectName = `videos/${uuidv4()}.${fileExtension}`;
        await s3Storage.uploadFile(path, s3ObjectName);
        
        [processingError, processingResponse] = await catchErrorTyped(
          axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { s3_object_name: s3ObjectName }, {
            headers: {
              'Content-Type': 'application/json',
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
    [processingError, processingResponse] = await catchErrorTyped(
      indexYoutube({
        youtubeUrl: path,
        isExternal,
        channelName: metadata?.channelName,
        documentTagIds,
        sourceCreationDate,
      }),
      [Error]
    )
    const youtubeChannelTag = await createOrGetTag(metadata?.channelName || "YOUTUBE")
    fileHash = extractYoutubeVideoId(path) || path;
    tags = [...tags, youtubeChannelTag]
  }

  // if everything goes well, we got the response from the server with the processed document and it's chunks
  // so we insert it into db
  if (processingResponse) {
    const documentId = await insertDocument({
      document: processingResponse.document,
      chunks: processingResponse.chunks,
      source: author,
      hash: fileHash,
      isExternal,
      documentTagIds: Array.from(new Set([...tags])),
      sourceCreationDate,
      title: title ?? undefined,
      credit: credit ?? undefined,
      isDownloadable,
      identifier: identifier || undefined,
      description: description || undefined,
      youtubeId: youtubeId || undefined,
    })
    return { success: true, message: 'Fichier indexé avec succès', documentId, fileHash };
  }
});