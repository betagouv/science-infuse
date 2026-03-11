import prisma from '@/lib/prisma';
import fs from "fs";
import { writeFile } from 'fs/promises';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { IndexingContentType } from '@/types/queueing';
import { DocumentTag } from '.prisma/client';
import { indexContentJob } from '@/queueing/pgboss/jobs/index-contents/index-content';
import { auth } from '@/auth';

const crypto = require('crypto');

const shouldSkipDuplicateCheck = () => process.env.SKIP_INDEX_DUPLICATE_CHECK === 'true';

const indexFile = async (content: File, author: string, documentTags: DocumentTag[], isExternal: boolean, title?: string, credit?: string, isDownloadable?: boolean, identifier?: string, description?: string, youtubeId?: string) => {
    const buffer = await content.arrayBuffer();
    const mimeType = content.type
    let fileExtensionFromMime = ''

    if (mimeType.startsWith('image/')) {
        fileExtensionFromMime = mimeType.split('/')[1]
    }
    else if (mimeType == 'application/pdf') {
        fileExtensionFromMime = 'pdf'
    }

    // Create a temporary file for indexing
    const tempFileName = `temp-${Date.now()}-${content.name}`;
    const localFilePath = path.join(process.cwd(), 'public', tempFileName);

    try {
        await writeFile(localFilePath, new Uint8Array(buffer));
        const fileContent = await fs.promises.readFile(localFilePath);
        const file = new File([fileContent], localFilePath.split('/').pop() || 'unknown', { type: 'application/octet-stream' });
        console.log(`Created File object: ${file.name}`);

        // Calculate the hash of the file
        const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex') as string;
        if (!shouldSkipDuplicateCheck()) {
            const fileExist = await prisma.document.findFirst({
                where: {
                    fileHash: fileHash,
                    deleted: false,
                }
            })

            if (fileExist) {
                await fs.promises.unlink(localFilePath);
                return NextResponse.json(fileExist, { status: 409 });
            }
        }

        const result = await indexContentJob.emit({
            path: localFilePath,
            type: IndexingContentType.file,
            documentTagIds: documentTags.map(t => t.id),
            author: author || undefined,
            isExternal,
            title,
            credit,
            isDownloadable,
            identifier: identifier || undefined,
            description: description || undefined,
            youtubeId: youtubeId || undefined,
        },
            { priority: 1 }
        )
        console.log("Job emitted:", result);

        return NextResponse.json(localFilePath);

    } catch (error) {
        console.error('Error indexing file:', error);
        return NextResponse.json({ error: 'Error indexing file' }, { status: 500 });
    }
}

const indexUrl = async (url: string, author: string, documentTags: DocumentTag[], isExternal: boolean) => {
    try {
        const fileExist = await prisma.document.findFirst({
            where: {
                originalPath: url,
                deleted: false,
            }
        })

        if (fileExist) {
            return NextResponse.json(fileExist, { status: 409 });
        }

        const result = await indexContentJob.emit({
            path: url,
            type: IndexingContentType.url,
            documentTagIds: documentTags.map(t => t.id),
            author: author,
            isExternal
        },
            { priority: 1 }
        )

        console.log("Job emitted:", result);

        return NextResponse.json(url);
    } catch (error) {
        console.error('Error indexing url:', error);
        return NextResponse.json({ error: 'Error indexing url' }, { status: 500 });
    }

}

const indexDraftFile = async (draftFileId: string, author: string, documentTags: DocumentTag[], isExternal: boolean, title?: string, credit?: string, isDownloadable?: boolean, identifier?: string, description?: string, youtubeId?: string) => {
    try {
        // Get the draft file from database
        const draftFile = await prisma.draftFile.findUnique({
            where: { id: draftFileId },
            include: { draft: true }
        });

        if (!draftFile) {
            return NextResponse.json({ error: 'Draft file not found' }, { status: 404 });
        }

        // For now, we'll create a placeholder file with the original name and type
        // In production, you'd fetch the actual file from S3 using draftFile.s3ObjectName
        const placeholderFile = new File([''], draftFile.originalName, {
            type: draftFile.mimeType,
        });

        // Get the actual file path where the draft file is stored
        const draftFilePath = path.join(process.cwd(), 'public', 'drafts', draftFile.s3ObjectName);
        
        try {
            // Check if the draft file exists
            if (!fs.existsSync(draftFilePath)) {
                console.error(`Draft file not found at path: ${draftFilePath}`);
                console.error(`Draft file s3ObjectName: ${draftFile.s3ObjectName}`);
                return NextResponse.json({ error: `Draft file not found on disk at path: ${draftFilePath}` }, { status: 404 });
            }
            
            // Create a temporary file for indexing (copy the draft file)
            const tempFileName = `temp-${Date.now()}-${draftFile.originalName}`;
            const tempFilePath = path.join(process.cwd(), 'public', tempFileName);
            
            // Copy the draft file to a temporary location
            const fileContent = await fs.promises.readFile(draftFilePath);
            await writeFile(tempFilePath, fileContent);
            
            const file = new File([fileContent], draftFile.originalName, { type: draftFile.mimeType });
            console.log(`Created File object from draft: ${file.name}`);

            // Calculate a hash for the file using actual content
            const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex') as string;
            
            if (!shouldSkipDuplicateCheck()) {
                const fileExist = await prisma.document.findFirst({
                    where: {
                        fileHash: fileHash,
                        deleted: false,
                    }
                });

                if (fileExist) {
                    return NextResponse.json(fileExist, { status: 409 });
                }
            }

            const result = await indexContentJob.emit({
                path: tempFilePath,
                type: IndexingContentType.file,
                documentTagIds: documentTags.map(t => t.id),
                author: author || undefined,
                isExternal,
                title,
                credit,
                isDownloadable,
                identifier: identifier || undefined,
                description: description || undefined,
                youtubeId: youtubeId || undefined,
            },
                { priority: 1 }
            );
            console.log("Job emitted:", result);

            return NextResponse.json(tempFilePath);

        } catch (error) {
            console.error('Error indexing draft file:', error);
            console.error('Draft file ID:', draftFileId);
            console.error('Draft file path:', draftFilePath);
            return NextResponse.json({ error: `Error indexing draft file: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
        }
    } catch (error) {
        console.error('Error in indexDraftFile:', error);
        console.error('Draft file ID:', draftFileId);
        return NextResponse.json({ error: `Error in indexDraftFile: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
    }
}

const indexYoutubeVideo = async (url: string, author: string, documentTags: DocumentTag[], isExternal: boolean) => {
    try {
        const fileExist = await prisma.document.findFirst({
            where: {
                originalPath: url,
                deleted: false,
            }
        })

        if (fileExist) {
            return NextResponse.json(fileExist, { status: 409 });
        }

        const result = await indexContentJob.emit({
            path: url,
            type: IndexingContentType.youtube,
            documentTagIds: documentTags.map(t => t.id),
            author: author || undefined,
            isExternal,
        },
            { priority: 1 }
        )

        console.log("Job emitted:", result);

        return NextResponse.json(url);
    } catch (error) {
        console.error('Error indexing url:', error);
        return NextResponse.json({ error: 'Error indexing url' }, { status: 500 });
    }

}


export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const content = formData.get('content') as File | string | null;
    const type = formData.get('type') as IndexingContentType;
    const author = formData.get('author') as string;
    console.log("formData.get('isExternal')", formData.get('isExternal'), formData.get('isExternal') === 'true')
    const isExternal = formData.get('isExternal') === 'true';
    const documentTags = JSON.parse(formData.get('documentTags') as string || "[]") as DocumentTag[];
    const title = (formData.get('title') as string | null) ?? '';
    const credit = (formData.get('credit') as string | null) ?? '';
    const isDownloadable = formData.get('isDownloadable') === 'true';
    const identifier = (formData.get('identifier') as string | null) ?? undefined;
    const description = (formData.get('description') as string | null) ?? undefined;
    const draftFileId = formData.get('draftFileId') as string;
    const youtubeId = formData.get('youtubeId') as string;
    const session = await auth();
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!content) {
        return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }
    console.log("INDEXING", type)

    if (type == IndexingContentType.url) {
        return indexUrl(content as string, author, documentTags, isExternal);
    }
    else if (type == IndexingContentType.youtube) {
        return indexYoutubeVideo(content as string, author, documentTags, isExternal)
    }
    else if (type == IndexingContentType.file) {
        if (draftFileId) {
            return indexDraftFile(draftFileId, author, documentTags, isExternal, title, credit, isDownloadable, identifier, description, youtubeId)
        } else {
            return indexFile(content as File, author, documentTags, isExternal, title, credit, isDownloadable, identifier, description, youtubeId)
        }
    }
}