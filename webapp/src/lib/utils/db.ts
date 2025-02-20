'use server'
import { ChapterWithBlock, UserFull } from "@/types/api";
import { DocumentChunk, Document, DocumentChunkMeta } from "@prisma/client";
import { v4 as uuidv4 } from 'uuid'; // Make sure to import the uuid library
import prisma from "../prisma";
import { getEmbeddings, getTextToEmbeed } from "./embeddings";
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

export const insertChunk = async (document: Document, chunk: DocumentChunk, metadata?: DocumentChunkMeta) => {
    const chunkId = uuidv4();
    const textToEmbeed = getTextToEmbeed({
        ...chunk,
        metadata,
        document
    });
    const textEmbedding = await getEmbeddings(textToEmbeed);
    // insert using queryRaw since vector is unsupported as a type.
    await prisma.$queryRaw`
    INSERT INTO "DocumentChunk" (
      id, text, "textEmbedding", title, "mediaType", "documentId"
    ) VALUES (
      ${chunkId}::uuid, 
      ${chunk.text},
      ${textEmbedding}::vector, 
      ${chunk.title}, 
      ${chunk.mediaType}, 
      ${document.id}::uuid
    )
  `;

    if (metadata) {
        await prisma.documentChunkMeta.create({
            data: {
                ...metadata,
                id: uuidv4(),
                documentChunkId: chunkId,
                //convert back Prisma.JsonValue
                bbox: metadata.bbox ? JSON.stringify(metadata.bbox) : undefined,
                word_segments: metadata.word_segments ? JSON.stringify(metadata.word_segments) : undefined,
            },
        });
    }

}

export const insertDocument = async ({ document, chunks, documentTagIds, hash, sourceCreationDate, isExternal }: {
    document: Document,
    chunks: (DocumentChunk & { document: Document, metadata: DocumentChunkMeta })[],
    documentTagIds: string[],
    hash?: string,
    sourceCreationDate?: Date,
    isExternal: boolean,
}): Promise<string> => {
    const createdDocument = await prisma.document.create({
        data: {
            ...document,
            isExternal,
            fileHash: hash,
            sourceCreationDate: sourceCreationDate,
            tags: {
                connect: documentTagIds.map(id => ({ id }))
            },
        },
    });

    // create chunks (and  metadatas) and link them to the new document
    await Promise.all(chunks.map(async ({ document, metadata,...chunk }) => {
        return insertChunk(document, chunk, metadata)
    }));

    return createdDocument.id;
}
export async function assignTagsToDocuments(documentIds: string[], tagIds: string[]) {
    try {
        // Verify that all tag IDs exist
        const existingTags = await prisma.documentTag.findMany({
            where: {
                id: {
                    in: tagIds
                }
            }
        });

        // Check if all provided tag IDs are valid
        if (existingTags.length !== tagIds.length) {
            throw new Error('Some tag IDs are invalid');
        }

        // Perform a batch update to connect documents with tags
        const updatePromises = documentIds.map(async (documentId) => {
            return prisma.document.update({
                where: { id: documentId },
                data: {
                    tags: {
                        connect: tagIds.map(tagId => ({ id: tagId }))
                    }
                }
            });
        });

        // Execute all updates
        const updatedDocuments = await Promise.all(updatePromises);

        return updatedDocuments;
    } catch (error) {
        console.error('Error assigning tags to documents:', error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
}

export async function removeAllTagsFromDocuments(documentIds: string[]) {
    try {
        // Perform a batch update to disconnect all tags from documents
        const updatePromises = documentIds.map(async (documentId) => {
            return prisma.document.update({
                where: { id: documentId },
                data: {
                    tags: {
                        set: [] // This will remove all tag connections
                    }
                }
            });
        });

        // Execute all updates
        const updatedDocuments = await Promise.all(updatePromises);

        return updatedDocuments;
    } catch (error) {
        console.error('Error removing tags from documents:', error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
}

export async function getAllDocumentTags() {
    try {
        const tags = await prisma.documentTag.findMany({
            include: {
                _count: {
                    select: { documents: true }
                }
            }
        });
        return tags;
    } catch (error) {
        console.error('Error fetching tags:', error);
        return [];
    } finally {
        await prisma.$disconnect();
    }
}


export async function createDocumentTag(data: {
    title: string,
    description: string
}) {
    try {
        const newTag = await prisma.documentTag.create({
            data: {
                title: data.title,
                description: data.description
            }
        });
        return newTag;
    } catch (error) {
        console.error('Error creating tag:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

export async function updateDocumentTag(
    id: string,
    data: {
        title?: string,
        description?: string
    }
) {
    try {
        const updatedTag = await prisma.documentTag.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description
            }
        });
        return updatedTag;
    } catch (error) {
        console.error('Error updating tag:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

export async function deleteDocumentTag(id: string) {
    try {
        await prisma.documentTag.delete({
            where: { id }
        });
        return { success: true };
    } catch (error) {
        console.error('Error deleting tag:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

export async function desindexDocuments(documentIds: string[]) {
    try {
        const updatedDocuments = await prisma.document.updateMany({
            where: {
                id: {
                    in: documentIds
                }
            },
            data: {
                deleted: true
            }
        })
        return updatedDocuments
    } catch (error) {
        console.error('Error deindexing documents:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

export async function indexDocuments(documentIds: string[]) {
    try {
        const updatedDocuments = await prisma.document.updateMany({
            where: {
                id: {
                    in: documentIds
                }
            },
            data: {
                deleted: false
            }
        })
        return updatedDocuments
    } catch (error) {
        console.error('Error indexing documents:', error)
        return []
    } finally {
        await prisma.$disconnect()
    }
}

