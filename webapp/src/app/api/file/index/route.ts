import { v4 as uuidv4 } from 'uuid'
import fs from "fs";
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import s3Storage from '../../S3Storage';
import { ServerProcessingResult } from '@/queueing/pgboss/jobs/index-contents';
import { catchErrorTyped } from '@/errors';
import indexYoutube from '@/queueing/pgboss/jobs/index-contents/index-youtube';
import { insertDocument } from '@/lib/utils/db';
import { z } from 'zod';
const crypto = require('crypto');

const PostSchema = z.object({
    file: z.instanceof(File).nullable(),
    youtubeUrl: z.string().nullable().optional(),
});

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const result = PostSchema.safeParse({
        file: formData.get('file'),
        youtubeUrl: formData.get('youtubeUrl')
    });

    if (!result.success) {
        return NextResponse.json({ error: result.error.message }, { status: 400 });
    }

    const { file, youtubeUrl } = result.data;
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!file && !youtubeUrl) {
        return NextResponse.json({ error: 'No file or YouTube URL provided' }, { status: 400 });
    }

    try {
        let fileHash: string | undefined;
        let s3ObjectName: string | undefined;

        if (file) {
            const buffer = await file.arrayBuffer();
            const mimeType = file.type
            let fileExtensionFromMime = ''
            if (mimeType.startsWith('image/')) {
                fileExtensionFromMime = mimeType.split('/')[1]
            }
            else if (mimeType == 'application/pdf') {
                fileExtensionFromMime = 'pdf'
            }
            const fileExtension = fileExtensionFromMime || file.name.split('.').pop() || ''
            console.log("FILE EXTENSION FROM MIME", fileExtensionFromMime)
            console.log("FILE EXTENSION", file.name.split('.').pop() || '')
            const fileName = `${uuidv4()}.${fileExtension}`

            const localFilePath = path.join(process.cwd(), 'public', fileName);

            await writeFile(localFilePath, new Uint8Array(buffer));
            const fileContent = await fs.promises.readFile(localFilePath);
            const fileObj = new File([fileContent], localFilePath.split('/').pop() || 'unknown', { type: 'application/octet-stream' });
            fileHash = crypto.createHash('sha256').update(fileContent).digest('hex') as string;

            s3ObjectName = `prof/${user.id}/${fileName}`;
            await s3Storage.uploadFile(localFilePath, s3ObjectName)
        }

        let processingError: Error | undefined;
        let processingResponse: ServerProcessingResult | undefined;

        [processingError, processingResponse] = await catchErrorTyped(
            indexYoutube({
                s3ObjectName,
                isExternal: false,
                channelName: "EXTERNAL",
                documentTagIds: [],
                youtubeUrl,
                // sourceCreationDate,
            }),
            [Error]
        )

        if (processingResponse) {
            const documentId = await insertDocument({
                document: processingResponse.document,
                chunks: processingResponse.chunks,
                userId: user.id,
                isPublic: false,
                hash: fileHash,
                isExternal: false,
                documentTagIds: [],
                // sourceCreationDate,
            })

            return NextResponse.json({documentId});
        }

        return NextResponse.json({});
    } catch (error) {
        console.error('Error writing file:', error);
        return NextResponse.json({ error: 'Error saving the file' }, { status: 500 });
    }
}