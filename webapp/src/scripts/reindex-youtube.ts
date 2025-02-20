import axios from "axios";
import { DocumentChunk, Document, PrismaClient } from '@prisma/client'
import cliProgress from 'cli-progress'
import { JSONContent } from '@tiptap/core'
import { youtube, youtube_v3 } from '@googleapis/youtube';
import {extractYoutubeVideoId} from '../lib/utils/youtube';
import {getDocumentFromVideoId} from '../queueing/pgboss/jobs/index-contents/index-youtube';
import {catchErrorTyped} from '../errors';
import {insertDocument} from '../lib/utils/db'

const prisma = new PrismaClient()


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

const indexYoutube = async (props: { youtubeUrl: string, channelName?: string, isExternal: boolean }) => {
    const { youtubeUrl, channelName, } = props;

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
        const processingResponse = await axios.post<ServerProcessingResult>(`${process.env.NEXT_PUBLIC_SERVER_URL}/process/youtube`, { url: youtubeUrl }, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => response.data);

        return processingResponse
    }
}



const Youtube = youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
})

interface VideoItem {
    title: string
    video_id: string
    publish_time: string,
    channel_name: string,
}

async function getChannelVideos(playlistId: string): Promise<VideoItem[]> {
    const formattedPlaylistId = `${playlistId[0]}U${playlistId.slice(2)}`
    const videos: VideoItem[] = []
    let nextPageToken: string | null = null


    while (true) {
        const response = await Youtube.playlistItems.list({
            part: ['snippet'],
            playlistId: formattedPlaylistId,
            maxResults: 50,
            pageToken: nextPageToken || undefined
        })

        const res: youtube_v3.Schema$PlaylistItemListResponse = response.data

        for (const item of res.items || []) {
            videos.push({
                title: item.snippet?.title || '',
                video_id: item.snippet?.resourceId?.videoId || '',
                publish_time: item.snippet?.publishedAt || '',
                channel_name: item.snippet?.channelTitle || '',
            })
        }

        nextPageToken = res.nextPageToken || null
        // break;
        if (!nextPageToken) {
            break
        }
    }

    return videos
}

interface ServerProcessingResult {
    document: Document;
    chunks: (DocumentChunk & { document: any, metadata: any })[];
}

const indexYoutubeVideo = async (url: string, channelName: string) => {
    let processingError: Error | undefined;
    let processingResponse: ServerProcessingResult | undefined;

    [processingError, processingResponse] = await catchErrorTyped(
        indexYoutube({
            youtubeUrl: url,
            isExternal: false,
            channelName: channelName,
        }),
        [Error]
    )
    const youtubeChannelTag = await createOrGetTag(channelName || "YOUTUBE")
    const fileHash = extractYoutubeVideoId(url) || url;
    if (processingResponse) {

        const documentId = await insertDocument({
            document: processingResponse.document,
            chunks: processingResponse.chunks,
            hash: fileHash,
            isExternal: false,
            documentTagIds: [youtubeChannelTag],
            // sourceCreationDate,
        })
    }


}

async function runChannelIndexation(channelId: string): Promise<void> {
    const channelVideos = await getChannelVideos(channelId)
    console.log(channelVideos.length)

    const progressYoutubeChannel = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    
    
    progressYoutubeChannel.start(channelVideos.length, 0)
    for (const [index, video] of Array.from(channelVideos.entries())) {
        const url = `https://www.youtube.com/watch?v=${video.video_id}`
        await indexYoutubeVideo(url, video.channel_name)
        progressYoutubeChannel.increment()
    }


    progressYoutubeChannel.stop()
}

const CHANNEL_LE_BLOB = "UC3E2DhYIqnoc6H3WXwTVnlA"
const CHANNEL_CITE_DES_SCIENCES = "UC2RSe5ZktAjE3qoMKi2pA_g"
const CHANNEL_PALAIS_DE_LA_DECOUVERTE = "UC1udnO-W6gpR9qzleJ5SDKw"




async function main() {
    await runChannelIndexation(CHANNEL_LE_BLOB)
    await runChannelIndexation(CHANNEL_CITE_DES_SCIENCES)
    await runChannelIndexation(CHANNEL_PALAIS_DE_LA_DECOUVERTE)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })