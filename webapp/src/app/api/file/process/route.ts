import axios from "axios";
import { randomUUID, createHash } from "crypto";
import { writeFile, unlink } from "fs/promises";
import path from "path";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { insertDocument } from "@/lib/utils/db";
import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { z } from "zod";
import type { ProcessDirectFileResponse, ProcessDirectFilePickedChunk } from "@/types/api/direct-file";
import s3Storage from "@/app/api/S3Storage";

const PostSchema = z.object({
  file: z.instanceof(File),
  mediaName: z.string().nullable().optional(),
  pickMediaType: z.string().nullable().optional(),
});

const pickChunkFromDb = async (params: { documentId: string; pickMediaType?: string | null }): Promise<ProcessDirectFilePickedChunk | undefined> => {
  const preferred = [params.pickMediaType, "pdf_image", "image"].filter(Boolean) as string[];

  const chunk = await prisma.documentChunk.findFirst({
    where: {
      documentId: params.documentId,
      mediaType: { in: preferred },
    },
    include: { metadata: true },
  });

  if (!chunk) return undefined;

  return {
    id: chunk.id,
    mediaType: chunk.mediaType,
    title: chunk.title,
    text: chunk.text,
    metadata: chunk.metadata || undefined,
  };
};

const getProcessingEndpoint = (mimeType: string): string | null => {
  if (mimeType === "application/pdf") return `${NEXT_PUBLIC_SERVER_URL}/process/pdf`;
  if (mimeType.startsWith("image/")) return `${NEXT_PUBLIC_SERVER_URL}/process/picture`;
  if (mimeType.startsWith("video/")) return `${NEXT_PUBLIC_SERVER_URL}/process/youtube`;
  return null;
};

const processVideo = async (buffer: Buffer, fileName: string) => {
  const extension = fileName.split(".").pop() || "mp4";
  const safeName = `${randomUUID()}.${extension}`;
  const s3ObjectName = `uploads/${safeName}`;
  const localFilePath = path.join(process.cwd(), "public", safeName);

  await writeFile(localFilePath, new Uint8Array(buffer));
  await s3Storage.uploadFile(localFilePath, s3ObjectName);
  await unlink(localFilePath).catch(() => {});

  return axios
    .post(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { s3_object_name: s3ObjectName }, {
      headers: { "Content-Type": "application/json" },
    })
    .then((r) => r.data);
};

const processFileUpload = async (buffer: Buffer, fileName: string, mimeType: string, endpoint: string) => {
  const extension = mimeType === "application/pdf" ? "pdf" : fileName.split(".").pop() || "bin";
  const safeName = `${randomUUID()}.${extension}`;
  const forwardedFile = new File([new Uint8Array(buffer)], safeName, { type: mimeType });

  const form = new FormData();
  form.append("file", forwardedFile);

  return axios
    .post(endpoint, form, { headers: { "Content-Type": "multipart/form-data" } })
    .then((r) => r.data);
};

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const result = PostSchema.safeParse({
    file: formData.get("file"),
    mediaName: formData.get("mediaName"),
    pickMediaType: formData.get("pickMediaType"),
  });

  if (!result.success) {
    return NextResponse.json({ error: result.error.message }, { status: 400 });
  }

  const { file, mediaName, pickMediaType } = result.data;

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Vous devez être authentifié pour pouvoir téléverser un fichier." }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session?.user?.id } });
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const fileHash = createHash("sha256").update(new Uint8Array(buffer)).digest("hex");

  const existing = await prisma.document.findFirst({
    where: { fileHash, deleted: false },
    select: { id: true },
  });

  if (existing) {
    const pickedChunk = await pickChunkFromDb({ documentId: existing.id, pickMediaType });
    return NextResponse.json<ProcessDirectFileResponse>({
      documentId: existing.id,
      pickedChunk,
      alreadyIndexed: true,
    });
  }

  const mimeType = file.type || "application/octet-stream";
  const isVideo = mimeType.startsWith("video/");

  const processingEndpoint = getProcessingEndpoint(mimeType);
  if (!processingEndpoint) {
    return NextResponse.json({ error: `Unsupported mimeType: ${mimeType}` }, { status: 400 });
  }

  const processingResponse = isVideo
    ? await processVideo(buffer, file.name)
    : await processFileUpload(buffer, file.name, mimeType, processingEndpoint);

  // Insert into DB (including embeddings)
  const documentId = await insertDocument({
    document: processingResponse.document,
    mediaName: mediaName || processingResponse?.document?.mediaName || file.name,
    chunks: processingResponse.chunks,
    documentTagIds: [],
    hash: fileHash,
    isExternal: false,
    userId: user.id,
    isPublic: false,
  });

  // If caller needs a usable chunkId (e.g. ImageACompleter), pick the best candidate from DB.
  const pickedChunk = await pickChunkFromDb({ documentId, pickMediaType });

  return NextResponse.json<ProcessDirectFileResponse>({
    documentId,
    pickedChunk,
  });
}
