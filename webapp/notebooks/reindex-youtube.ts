import { youtube, youtube_v3 } from '@googleapis/youtube';
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const Youtube = youtube({
    version: 'v3',
    auth: process.env.YOUTUBE_API_KEY,
})

interface VideoItem {
    title: string
    video_id: string
    publish_time: string
    duration_seconds: number
}

async function getVideoDuration(videoId: string): Promise<number> {
    const response = await Youtube.videos.list({
        part: ['contentDetails'],
        id: [videoId]
    });

    const duration = response.data.items?.[0]?.contentDetails?.duration || 'PT0S';
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = parseInt(match?.[1] || '0');
    const minutes = parseInt(match?.[2] || '0');
    const seconds = parseInt(match?.[3] || '0');
    
    return hours * 3600 + minutes * 60 + seconds;
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
            const videoId = item.snippet?.resourceId?.videoId || '';
            const duration = await getVideoDuration(videoId);
            videos.push({
                title: item.snippet?.title || '',

                video_id: videoId,
                publish_time: item.snippet?.publishedAt || '',
                duration_seconds: duration,
            })
        }

        nextPageToken = res.nextPageToken || null
        break;
        if (!nextPageToken) {
            break
        }
    }

    return videos
}

const isUrlAlreadyIndexed = async (url: string): Promise<boolean> => {
    const document = await prisma.document.findFirst({
        where: {
            originalPath: {
                contains: url
            }
        },
        select: {
            id: true
        }
    })
    return !!document
}

async function indexChannel(channelId: string, useOauth: boolean): Promise<void> {
    const channelVideos = await getChannelVideos(channelId)
    console.log(channelVideos.length)

    for (const [index, video] of Array.from(channelVideos.entries())) {
        const url = `https://www.youtube.com/watch?v=${video.video_id}`
        // console.log(`Title: ${video.title}`)
        // console.log(`Video ID: ${video.video_id}`)
        const alreadyIndexed = await isUrlAlreadyIndexed(video.video_id);
        if (alreadyIndexed) {
            console.log(`Already in DB, SKIP INDEXING ${video.title.slice(0, 40)} | ${video.publish_time} | ${video.duration_seconds} | ${url}`)
        } else {
            console.log(`NOT in DB, INDEXING ${video.title.slice(0, 40)} | ${url}`)
        }
    }
}

// Channel IDs
const CHANNEL_LE_BLOB = "UC3E2DhYIqnoc6H3WXwTVnlA"
const CHANNEL_CITE_DES_SCIENCES = "UC2RSe5ZktAjE3qoMKi2pA_g"
const CHANNEL_PALAIS_DE_LA_DECOUVERTE = "UC1udnO-W6gpR9qzleJ5SDKw"

const useOauth = false

async function main() {
    await indexChannel(CHANNEL_LE_BLOB, useOauth)
    // await indexChannel(CHANNEL_CITE_DES_SCIENCES, useOauth)
    // await indexChannel(CHANNEL_PALAIS_DE_LA_DECOUVERTE, useOauth)
}

main().catch(console.error).then(() => {
    prisma.$disconnect()
})