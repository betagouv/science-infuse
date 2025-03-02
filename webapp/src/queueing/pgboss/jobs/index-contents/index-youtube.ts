import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { catchErrorTyped, DocumentAlreadyIndexed } from "@/errors";
import { extractYoutubeVideoId } from "@/lib/utils/youtube";
import axios from "axios";
import { ServerProcessingResult } from ".";
import prisma from "@/lib/prisma";
import { insertDocument } from "@/lib/utils/db";


export const getDocumentFromVideoId = async (videoId: string) => {
    const document = await prisma.document.findFirst({
        where: {
            originalPath: {
                contains: videoId
            }
        },
        select: {
            id: true
        }
    })
    return document?.id
}

export const createOrGetTag = async (channelName: string) => {
    const channelTag = "YOUTUBE_" + channelName
        .replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, '')
        .toUpperCase()
        .replace(/\s+/g, '_');

    const tag = await prisma.documentTag.upsert({
        where: {
            title: channelTag
        },
        create: {
            title: channelTag,
            description: `YouTube channel: ${channelName}`
        },
        update: {},
        select: {
            id: true
        }
    });
    return tag.id;
}


export default async (props: { youtubeUrl?: string | null, s3ObjectName?: string, channelName?: string, documentTagIds: string[], sourceCreationDate?: Date, isExternal: boolean }) => {
    const { youtubeUrl, s3ObjectName, channelName, documentTagIds, sourceCreationDate } = props;

    if (!(youtubeUrl || s3ObjectName)) throw new Error("You need to provide a YouTube URL or an S3 object name.");

    // deal with video file
    if (s3ObjectName) {
        const processingResponse = await axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { s3_object_name: s3ObjectName }, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => response.data);

        return processingResponse
    }

    if (!youtubeUrl) return;

    // deal with youtube url
    const videoId = extractYoutubeVideoId(youtubeUrl) || youtubeUrl;
    const documentId = await getDocumentFromVideoId(videoId)
    const isVideoAlreadyIndexed = !!documentId;

    // dynamically create a tag for the youtube channel (or get the already existing one)
    const youtubeChannelTag = await createOrGetTag(channelName || "YOUTUBE")

    // if video already exist in db skip processing but still update the db with relevent data
    if (isVideoAlreadyIndexed) {
        await prisma.document.update({
            where: {
                id: documentId
            },
            data: {
                tags: {
                    connect: [{ id: youtubeChannelTag }]
                }
            }
        })

        throw new DocumentAlreadyIndexed(documentId, `Document with URL ${youtubeUrl} has already been indexed`);
    }
    // compute youtube video and create new document
    else {
        const processingResponse = await axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { url: youtubeUrl }, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => response.data);

        return processingResponse
    }
}
