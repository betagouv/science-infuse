import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { DocumentTag } from '@prisma/client';
import fs from 'fs';
import { writeFile } from 'fs/promises';
import path from 'path';

// GET - Retrieve user's drafts or specific draft
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const draftId = searchParams.get('draftId');

        if (draftId) {
            // Get specific draft
            const draft = await prisma.draft.findFirst({
                where: {
                    id: draftId,
                    userId: session.user.id
                },
                include: {
                    files: true
                }
            });

            if (!draft) {
                return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
            }

            // Get document tags
            const documentTags = await prisma.documentTag.findMany({
                where: {
                    id: {
                        in: draft.documentTagIds
                    }
                }
            });

            return NextResponse.json({
                draft: {
                    ...draft,
                    documentTags
                }
            });
        } else {
            // Get all user's drafts
            const drafts = await prisma.draft.findMany({
                where: {
                    userId: session.user.id
                },
                include: {
                    files: true
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });

            // Get document tags for all drafts
            const allTagIds = Array.from(new Set(drafts.flatMap(draft => draft.documentTagIds)));
            const documentTags = await prisma.documentTag.findMany({
                where: {
                    id: {
                        in: allTagIds
                    }
                }
            });

            const draftsWithTags = drafts.map(draft => ({
                ...draft,
                documentTags: documentTags.filter(tag => draft.documentTagIds.includes(tag.id))
            }));

            return NextResponse.json({
                drafts: draftsWithTags
            });
        }
    } catch (error) {
        console.error('Error fetching drafts:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Create new draft or update existing draft
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const formData = await request.formData();
        const title = formData.get('title') as string;
        const credit = formData.get('credit') as string;
        const source = formData.get('source') as string;
        const isDownloadable = formData.get('isDownloadable') === 'true';
        const documentTagIds = JSON.parse(formData.get('documentTagIds') as string || '[]') as string[];
        const identifier = formData.get('identifier') as string;
        const description = formData.get('description') as string;
        const contentType = formData.get('contentType') as string; // 'images', 'videos', 'pdf'
        const files = formData.getAll('files') as File[];
        const fileIptcData = JSON.parse(formData.get('fileIptcData') as string || '[]') as Array<{ iptcData?: unknown }>;
        const draftId = formData.get('draftId') as string; // For updating existing draft

        let draft;
        
        if (draftId) {
            // Update existing draft
            draft = await prisma.draft.findFirst({
                where: {
                    id: draftId,
                    userId: session.user.id
                }
            });

            if (!draft) {
                return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
            }

            // Update draft fields
            draft = await prisma.draft.update({
                where: { id: draftId },
                data: {
                    title,
                    credit,
                    source,
                    isDownloadable,
                    documentTagIds,
                    identifier,
                    description,
                    contentType
                }
            });
        } else {
            // Create new draft
            draft = await prisma.draft.create({
                data: {
                    title,
                    credit,
                    source,
                    isDownloadable,
                    documentTagIds,
                    identifier,
                    description,
                    contentType,
                    userId: session.user.id
                }
            });
        }

        // Handle file uploads
        const uploadedFiles = [];
        for (let index = 0; index < files.length; index += 1) {
            const file = files[index];
            if (file.size > 0) {
                // Generate unique filename
                const timestamp = Date.now();
                const fileExtension = file.name.split('.').pop();
                const uniqueFileName = `draft-${draft.id}-${timestamp}.${fileExtension}`;
                
                // Store the actual file content temporarily
                const buffer = await file.arrayBuffer();
                const localFilePath = path.join(process.cwd(), 'public', 'drafts', uniqueFileName);
                
                // Ensure drafts directory exists
                const draftsDir = path.join(process.cwd(), 'public', 'drafts');
                if (!fs.existsSync(draftsDir)) {
                    console.log(`Creating drafts directory: ${draftsDir}`);
                    fs.mkdirSync(draftsDir, { recursive: true });
                }
                
                // Write the actual file content
                await writeFile(localFilePath, new Uint8Array(buffer));
                
                const iptcData = fileIptcData[index]?.iptcData ?? undefined;

                const draftFile = await prisma.draftFile.create({
                    data: {
                        originalName: file.name,
                        s3ObjectName: uniqueFileName, // Store the local file path
                        mimeType: file.type,
                        size: file.size,
                        iptcData,
                        draftId: draft.id
                    }
                });
                uploadedFiles.push(draftFile);
            }
        }

        return NextResponse.json({
            success: true,
            draft: {
                ...draft,
                files: uploadedFiles
            }
        });
    } catch (error) {
        console.error('Error saving draft:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE - Delete specific draft
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const draftId = searchParams.get('draftId');

        if (!draftId) {
            return NextResponse.json({ error: 'Draft ID required' }, { status: 400 });
        }

        const draft = await prisma.draft.findFirst({
            where: {
                id: draftId,
                userId: session.user.id
            }
        });

        if (!draft) {
            return NextResponse.json({ error: 'Draft not found' }, { status: 404 });
        }

        // Get all draft files to delete from filesystem
        const draftFiles = await prisma.draftFile.findMany({
            where: { draftId: draft.id }
        });

        // Delete files from filesystem
        for (const draftFile of draftFiles) {
            const filePath = path.join(process.cwd(), 'public', 'drafts', draftFile.s3ObjectName);
            try {
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            } catch (error) {
                console.error(`Error deleting file ${filePath}:`, error);
            }
        }

        // Delete draft files from database (cascade should handle this, but being explicit)
        await prisma.draftFile.deleteMany({
            where: { draftId: draft.id }
        });

        // Delete draft
        await prisma.draft.delete({
            where: { id: draft.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting draft:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
