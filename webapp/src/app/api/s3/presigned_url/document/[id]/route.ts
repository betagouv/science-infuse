import s3Storage from "@/app/api/S3Storage";
import prisma from "@/lib/prisma";
import { ChunkData, TableOfContents, TOCItem } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const id = params.id;

    if (!id) {
        return new Response('Missing id parameter', { status: 400 })
    }
    
    const document = await prisma.document.findUnique({
        where: { id },
    })
    
    if (!document) {
        return new Response('Document not found', { status: 404 })
    }

    try {
        const presignedUrl = await s3Storage.getPresignedUrl(document.s3ObjectName);
        return NextResponse.json(presignedUrl)
    } catch (error) {
        console.error('Error building table of contents:', error);
        return NextResponse.json({ error: 'Error building table of contents' }, { status: 404 });
    }
}