import prisma from '@/lib/prisma';
import { indexFileJob } from '@/queueing/pgboss/jobs/index-file';
import fs from "fs";
import { writeFile } from 'fs/promises';
import { getServerSession } from 'next-auth/next';
import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
const crypto = require('crypto');

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const author = formData.get('author') as string | null;
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!file) {
        return NextResponse.json({ error: 'No file file provided' }, { status: 400 });
    }


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
    // const fileName = `${uuidv4()}.${fileExtension}`
    const localFilePath = path.join(process.cwd(), 'public', file.name);

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

        const result = await indexFileJob.emit({
            filePath: localFilePath,
            author: author || undefined
        })
        console.log("Job emitted:", result);

        return NextResponse.json(localFilePath);
    } catch (error) {
        console.error('Error writing file:', error);
        return NextResponse.json({ error: 'Error saving the file' }, { status: 500 });
    }
}