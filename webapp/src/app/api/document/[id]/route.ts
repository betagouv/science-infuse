import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { withAccessControl } from "../../accessControl";
import { auth } from "@/auth";
import { User } from "next-auth";
import { getEmbeddings, getTextToEmbeed } from "@/lib/utils/embeddings";
import { DocumentChunk, DocumentChunkMeta, Document } from "@prisma/client";

export const GET = withAccessControl(
    { allowedRoles: ['*'] },
    async (request: NextRequest, { user, params }: { user: User, params: { id: string } }) => {
        const session = await auth();
        const userId = session?.user.id

        const document = await prisma.document.findUnique({
            where: { id: params.id },
            include: {
                tags: true,
                documentChunks: {
                    include: {
                        metadata: true,
                        document: true,
                    }
                }
            }
        })
        // if (!document || (document.isPublic == false && document.userId != userId)) {
        if (!document) {
            return NextResponse.json({ error: 'Document not found' }, { status: 404 });
        }
        const { documentChunks, ...documentWithoutChunks } = document || {};
        const documentWithAliasedChunks = {
            ...documentWithoutChunks,
            chunks: documentChunks
        };
        return NextResponse.json(documentWithAliasedChunks);
    }
)

export const PUT = withAccessControl(
    { allowedRoles: ['ADMIN'] },
    async (request: NextRequest, { user, params }: { user: User, params: { id: string } }) => {
        const session = await auth();

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const id = params.id;

        if (!id) {
            return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 });
        }

        try {
            const body = await request.json();
            const { title, credit, source, isDownloadable, tagIds, identifier, description } = body;

            // Check if we need to re-embed (title or description changed)
            const needsReembed = title !== undefined || description !== undefined;

            // Update document fields
            const updateData: any = {};
            if (title !== undefined) updateData.title = title;
            if (credit !== undefined) updateData.credit = credit;
            if (source !== undefined) updateData.source = source;
            if (isDownloadable !== undefined) updateData.isDownloadable = isDownloadable;
            if (identifier !== undefined) updateData.identifier = identifier;
            if (description !== undefined) updateData.description = description;

            const updatedDocument = await prisma.document.update({
                where: { id: id },
                data: updateData,
                include: {
                    tags: true
                }
            });

            // Update tags if provided
            if (tagIds !== undefined) {
                await prisma.document.update({
                    where: { id: id },
                    data: {
                        tags: {
                            set: tagIds.map((tagId: string) => ({ id: tagId }))
                        }
                    }
                });
            }

            // Re-embed chunks if title or description changed
            if (needsReembed) {
                // Fetch document with chunks
                const documentWithChunks = await prisma.document.findUnique({
                    where: { id: id },
                    include: {
                        documentChunks: {
                            include: {
                                metadata: true,
                                document: true
                            }
                        }
                    }
                });

                if (documentWithChunks) {
                    // Re-embed all chunks asynchronously (don't wait for completion)
                    Promise.all(
                        documentWithChunks.documentChunks.map(async (chunk) => {
                            try {
                                const textToEmbeed = getTextToEmbeed({
                                    ...chunk,
                                    metadata: chunk.metadata || undefined
                                });
                                const embeddings = await getEmbeddings(textToEmbeed);
                                await prisma.$queryRaw`
                                    UPDATE "DocumentChunk"
                                    SET "textEmbedding" = ${embeddings}::vector
                                    WHERE id = ${chunk.id}::uuid
                                `;
                            } catch (error) {
                                console.error(`Error re-embedding chunk ${chunk.id}:`, error);
                            }
                        })
                    ).catch(error => {
                        console.error('Error during re-embedding process:', error);
                    });
                }
            }

            // Fetch the updated document with tags
            const finalDocument = await prisma.document.findUnique({
                where: { id: id },
                include: {
                    tags: true
                }
            });

            return NextResponse.json(finalDocument);

        } catch (error) {
            console.error('Error updating document:', error);
            return NextResponse.json({ error: 'An error occurred while updating the document' }, { status: 500 });
        }
    }
)

export const DELETE = withAccessControl(
    { allowedRoles: ['ADMIN'] },
    async (request: NextRequest, { user, params }: { user: User, params: { id: string } }) => {
        const session = await auth();

        const id = params.id;

        if (!id) {
            return new Response('Missing id parameter', { status: 400 })
        }

        try {
            await prisma.document.update({
                where: { id: id },
                data: {
                    deleted: true,
                    deletedAt: new Date()
                }
            });

            return NextResponse.json(true);

        } catch (error) {
            console.error('Error:', error);
            return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
        }
    })
