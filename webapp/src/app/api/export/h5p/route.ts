import { ExportH5pResponse } from '@/types/api';
import { ExportH5PInteractiveVideoRequest, ExportH5PQuestionRequest, ExportH5PRequestBody } from '@/types/api/export';
import { NextRequest, NextResponse } from "next/server";
import createQuestionSet from './creation-requests/createQuestionSet';
import createInteractiveVideo from './creation-requests/createInteractiveVideo';
import { withAccessControl } from '../../accessControl';
import { User } from 'next-auth';
import s3Storage from '../../S3Storage';
import prisma from '@/lib/prisma';
import fs from 'fs/promises';
import { h5pIdToPublicUrl } from '@/types/vectordb';

export const dynamic = 'force-dynamic'

function isQuestionRequest(body: ExportH5PRequestBody): body is ExportH5PQuestionRequest {
    return body.type === 'question';
}

function isInteractiveVideoRequest(body: ExportH5PRequestBody): body is ExportH5PInteractiveVideoRequest {
    return body.type === 'interactive-video';
}

async function downloadH5PFile(id: string): Promise<string> {
    const downloadUrl = `${process.env.H5P_URL}/h5p/download/${id}`;
    const response = await fetch(downloadUrl);
    const filePath = `${id}.h5p`;
    const buffer = Buffer.from(await response.arrayBuffer());
    await fs.writeFile(filePath, buffer);
    return filePath;
}

// create or edit h5p content using h5p docker micro-service
export const POST = withAccessControl(
    { allowedRoles: ['*'] },
    async (request: NextRequest, { user }: { user: User }) => {
        const body: ExportH5PRequestBody = await request.json();
        let game;
        let type = "";
        if (isQuestionRequest(body)) {
            game = await createQuestionSet(body.data, body.h5pContentId);
            type = "quiz";
        } else if (isInteractiveVideoRequest(body)) {
            game = await createInteractiveVideo(body.data, body.h5pContentId);
            type = "video";
        }
        else {
            throw new Error(`Unsupported type: ${body.type}`);
        }

        const fileName = `h5p-${game.contentId}`;
        const downloadH5p = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${game.contentId}&name=${fileName}&media=h5p`;
        const downloadHTML = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${game.contentId}&name=${fileName}&media=html`;
        const embedUrl = h5pIdToPublicUrl(game.contentId, fileName);

        // when the h5p is created, export it to h5p file and upload it to s3
        // this is done to have a backup of the h5p content if the h5p docker micro-service loses it
        // If the H5P server doesn't have the file, it will be downloaded from the S3 bucket.

        const filePath = await downloadH5PFile(game.contentId);
        const publicS3Path = await s3Storage.uploadFile(filePath, fileName);
        await fs.unlink(filePath);

        const h5pexist = await prisma.h5PContent.findFirst({
            where: {
                h5pId: `${game.contentId}`
            }
        })
        if (publicS3Path && !h5pexist)
            await prisma.h5PContent.create({
                data: {
                    title: `${game.contentId}`,
                    contentType: type,
                    s3ObjectName: fileName,
                    h5pId: `${game.contentId}`,
                    user: {
                        connect: { id: user.id }
                    },
                    documents: {
                        connect: body.documentIds.map(id => ({ id }))
                    }
                }
            })

        return NextResponse.json({ downloadH5p, downloadHTML, embedUrl: embedUrl, h5pContentId: game.contentId } as ExportH5pResponse);
    }
)

// route to download the h5p by id
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const media = searchParams.get('media');
    const name = searchParams.get('name');

    if (!id) {
        throw new Error('id is required');
    }
    const downloadUrl = media === 'html'
        ? `${process.env.H5P_PUBLIC_URL}/h5p/html/${id}`
        : `${process.env.H5P_PUBLIC_URL}/h5p/download/${id}`;
    const response = await fetch(downloadUrl);

    return new NextResponse(response.body, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${name}-${id}.${media}"`
        }
    });
}