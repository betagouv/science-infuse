import s3Storage from "@/app/api/S3Storage";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: { object_name: string[] } }
) {
    const object_name = params.object_name.join('/');

    if (!object_name) {
        return new Response('Missing object_name parameter', { status: 400 })
    }

    try {
        const presignedUrl = await s3Storage.getPresignedUrl(object_name);
        if (presignedUrl)
            return NextResponse.redirect(new URL(presignedUrl))
        else
            return NextResponse.json({ error: 'Presigned URL not found' }, { status: 404 });

    } catch (error) {
        console.error('Error building table of contents:', error);
        return NextResponse.json({ error: 'Error building table of contents' }, { status: 404 });
    }
}