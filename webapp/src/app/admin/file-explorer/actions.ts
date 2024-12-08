"use server";

import prisma from "@/lib/prisma";

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

