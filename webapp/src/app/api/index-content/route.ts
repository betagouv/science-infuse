import prisma from '@/lib/prisma';
import fs from "fs";
import { writeFile } from 'fs/promises';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../auth/[...nextauth]/authOptions';
import { IndexingContentType } from '@/types/queueing';
import { DocumentTag } from '.prisma/client';
import { indexContentJob } from '@/queueing/pgboss/jobs/index-contents';

const crypto = require('crypto');

const indexFile = async (content: File, author: string, documentTags: DocumentTag[]) => {
    const buffer = await content.arrayBuffer();
    const mimeType = content.type
    let fileExtensionFromMime = ''

    if (mimeType.startsWith('image/')) {
        fileExtensionFromMime = mimeType.split('/')[1]
    }
    else if (mimeType == 'application/pdf') {
        fileExtensionFromMime = 'pdf'
    }

    const localFilePath = path.join(process.cwd(), 'public', content.name);

    try {
        await writeFile(localFilePath, new Uint8Array(buffer));
        const fileContent = await fs.promises.readFile(localFilePath);
        const file = new File([fileContent], localFilePath.split('/').pop() || 'unknown', { type: 'application/octet-stream' });
        console.log(`Created File object: ${file.name}`);

        // Calculate the hash of the file
        const fileHash = crypto.createHash('sha256').update(fileContent).digest('hex') as string;
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

        const result = await indexContentJob.emit({
            path: localFilePath,
            type: IndexingContentType.file,
            documentTagIds: documentTags.map(t => t.id),
            author: author || undefined
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

const indexUrl = async (url: string, author: string, documentTags: DocumentTag[]) => {
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
            author: author
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

const indexYoutubeVideo = async (url: string, author: string, documentTags: DocumentTag[]) => {
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
            author: author || undefined
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
    const documentTags = JSON.parse(formData.get('documentTags') as string || "[]") as DocumentTag[];
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!content) {
        return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }
    console.log("INDEXING", type)

    if (type == IndexingContentType.url) {
        return indexUrl(content as string, author, documentTags);
    }
    else if (type == IndexingContentType.youtube) {
        return indexYoutubeVideo(content as string, author, documentTags)
    }
    else if (type == IndexingContentType.file) {
        return indexFile(content as File, author, documentTags)
    }
}