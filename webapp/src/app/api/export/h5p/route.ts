import { ExportH5pResponse } from '@/types/api';
import { ExportH5PInteractiveVideoRequest, ExportH5PQuestionRequest, ExportH5PRequestBody } from '@/types/api/export';
import { NextRequest, NextResponse } from "next/server";
import { generateInteraciveVideoData, InteractiveVideoData } from './contents/interactiveVideo';
import { createH5P } from './creation-requests';
import createQuestionSet from './creation-requests/createQuestionSet';
import createInteractiveVideo from './creation-requests/createInteractiveVideo';

export const dynamic = 'force-dynamic'

function isQuestionRequest(body: ExportH5PRequestBody): body is ExportH5PQuestionRequest {
    return body.type === 'question';
}

function isInteractiveVideoRequest(body: ExportH5PRequestBody): body is ExportH5PInteractiveVideoRequest {
    return body.type === 'interactive-video';
}

// create h5p content using h5p docker micro-service
// returns the download url
export async function POST(request: NextRequest) {
    const body: ExportH5PRequestBody = await request.json();

    if (isQuestionRequest(body)) {
        const game = await createQuestionSet(body.data);
        const downloadUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${game.contentId}&name=qcm-science-infuse`;
        return NextResponse.json({ downloadUrl } as ExportH5pResponse);
    } else if (isInteractiveVideoRequest(body)) {
        // const videoQcm = await generateInteraciveVideoData(body.data.documentId)
        // if (!videoQcm) throw new Error(`Unsupported type: ${body.type}`);
        const game = await createInteractiveVideo(body.data);
        const downloadUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${game.contentId}&name=interactive-video-science-infuse`;
        const embedUrl = `${process.env.H5P_PUBLIC_URL}/h5p/play/${game.contentId}`;
        return NextResponse.json({ downloadUrl, embedUrl: embedUrl } as ExportH5pResponse);
    }
    else {
        throw new Error(`Unsupported type: ${body.type}`);
    }
}

// route to download the h5p by id
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const name = searchParams.get('name');

    if (!id) {
        throw new Error('id is required');
    }

    const downloadUrl = `${process.env.H5P_URL}/h5p/download/${id}`;
    const response = await fetch(downloadUrl);

    return new NextResponse(response.body, {
        headers: {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${name}-${id}.h5p"`
        }
    });
}