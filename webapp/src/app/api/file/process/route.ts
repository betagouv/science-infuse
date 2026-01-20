import axios from "axios";
import { randomUUID, createHash } from "crypto";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { insertDocument } from "@/lib/utils/db";
import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { z } from "zod";
import type { ProcessDirectFileResponse, ProcessDirectFilePickedChunk } from "@/types/api/direct-file";

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
  const processingEndpoint =
    mimeType === "application/pdf"
      ? `${NEXT_PUBLIC_SERVER_URL}/process/pdf`
      : mimeType.startsWith("image/")
        ? `${NEXT_PUBLIC_SERVER_URL}/process/picture`
        : null;

  if (!processingEndpoint) {
    return NextResponse.json({ error: `Unsupported mimeType: ${mimeType}` }, { status: 400 });
  }

  // The python backend currently writes the upload to `file.filename`.
  // Use a random filename to avoid collisions.
  const extension = mimeType === "application/pdf" ? "pdf" : file.name.split(".").pop() || "bin";
  const safeName = `${randomUUID()}.${extension}`;
  // Node's Buffer is not a valid BlobPart in TS typings; wrap it.
  const forwardedFile = new File([new Uint8Array(buffer)], safeName, { type: mimeType });

  const upstreamForm = new FormData();
  upstreamForm.append("file", forwardedFile);

  // Call python backend (FastAPI)
  const processingResponse = await axios
    .post(processingEndpoint, upstreamForm, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
    .then((r) => r.data);

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
