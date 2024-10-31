import { ChapterWithBlock, UserFull } from "@/types/api";
import { DocumentChunk, Document } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'; // Make sure to import the uuid library
import prisma from "../prisma";
import { getEmbeddings } from "./getEmbeddings";
import { userFullFields } from "@/app/api/accessControl";

export const getChaptersWithBlocks = async (userId: string): Promise<ChapterWithBlock[]> => {
    return await prisma.chapter.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            createdAt: 'desc',
        },
        include: {
            theme: true,
            commentThread: true,
            blocks: {
                include: {
                    keyIdeas: true,
                    activities: true,
                    tags: true,
                }
            },
            skills: true,
            educationLevels: true,
            user: {
                select: userFullFields
            },
        }
    });
}

export const getUserFull = async (userId: string) => {
    const user: UserFull | null = await prisma.user.findUnique({
        where: { id: userId },
        select: userFullFields
    });
    return user;
}

export const insertDocument = async (document: Document, chunks: (DocumentChunk & { document: any, metadata: any })[], hash: string): Promise<string> => {

    const createdDocument = await prisma.document.create({
        data: {
            ...document,
            fileHash: hash,
        },
    });

    // create chunks (and  metadatas) and link them to the new document
    await Promise.all(chunks.map(async ({ document, metadata, id, ...chunk }) => {
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
    return createdDocument.id;
}