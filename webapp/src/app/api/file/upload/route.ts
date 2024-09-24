import { v4 as uuidv4 } from 'uuid'
import { NextRequest, NextResponse } from 'next/server';
import { writeFile, readFile } from 'fs/promises';
import path from 'path';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import { getServerSession } from 'next-auth/next';
import prisma from '@/lib/prisma';
import s3Storage from '../../S3Storage';
import { File as DbFile } from '@prisma/client';

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
    console.log("FILE EXTENSION FROM MIME", fileExtensionFromMime)
    console.log("FILE EXTENSION", file.name.split('.').pop() || '')
    const fileName = `${uuidv4()}.${fileExtension}`

    const localFilePath = path.join(process.cwd(), 'public', fileName);

    try {
        await writeFile(localFilePath, new Uint8Array(buffer));
        const s3ObjectName = `prof/${user.id}/${fileName}`;
        await s3Storage.uploadFile(localFilePath, s3ObjectName)

        const dbfile = await prisma.file.create({
            data: {
                userId: user.id,
                description: '',
                author: author || `${user.firstName} ${user.lastName}`,
                extension: fileExtension,
                s3ObjectName: s3ObjectName,
                shared: false
            }
        })

        return NextResponse.json<DbFile>(dbfile);
    } catch (error) {
        console.error('Error writing file:', error);
        return NextResponse.json({ error: 'Error saving the file' }, { status: 500 });
    }
}

// export async function GET(request: NextRequest) {
//     const fileName = request.nextUrl.searchParams.get('fileName');

//     if (!fileName) {
//         return NextResponse.json({ error: 'Invalid file name' }, { status: 400 });
//     }

//     const filePath = path.join(process.cwd(), 'public', 'uploads', fileName);

//     try {
//         const imageBuffer = await readFile(filePath);
//         return new NextResponse(imageBuffer, {
//             headers: { 'Content-Type': 'image/jpeg' }, // Adjust content type as needed
//         });
//     } catch (error) {
//         console.error('Error reading file:', error);
//         return NextResponse.json({ error: 'Image not found' }, { status: 404 });
//     }
// }