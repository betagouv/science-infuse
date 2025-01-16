import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { catchErrorTyped } from "@/errors";
import { extractYoutubeVideoId } from "@/lib/utils/youtube";
import axios from "axios";
import { ServerProcessingResult } from ".";
import prisma from "@/lib/prisma";
import { insertDocument } from "@/lib/utils/db";


const getDocumentFromVideoId = async (videoId: string) => {
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

const createOrGetTag = async (channelName: string) => {
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


export default async (props: { youtubeUrl: string, channelName?: string, documentTagIds: string[], sourceCreationDate?: Date }) => {
    const { youtubeUrl, channelName, documentTagIds, sourceCreationDate } = props;

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

        throw new Error("Video already indexed")
    }
    // compute youtube video and create new document
    else {
        const processingResponse = await axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { url: youtubeUrl }, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => response.data);

        await insertDocument({
            document: processingResponse.document,
            chunks: processingResponse.chunks,
            hash: videoId,
            // merge user tag
            documentTagIds: Array.from(new Set([...documentTagIds, youtubeChannelTag])),
            sourceCreationDate,
        })
        return processingResponse
    }
}
