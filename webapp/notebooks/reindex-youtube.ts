import { YouTube } from 'youtube-api'
import { S3Storage } from './storage'
import { SIWhisperModel } from './whisper'
import { YoutubeProcessor } from './processor'

interface VideoItem {
    title: string
    video_id: string
    publish_time: string
}

async function getChannelVideos(playlistId: string): Promise<VideoItem[]> {
    const formattedPlaylistId = `${playlistId[0]}U${playlistId.slice(2)}`
    const videos: VideoItem[] = []
    let nextPageToken: string | null = null
    
    while (true) {
        const res = await youtube.playlistItems().list({
            part: 'snippet',
            playlistId: formattedPlaylistId,
            maxResults: 50,
            pageToken: nextPageToken || undefined
        })
        
        for (const item of res.items) {
            videos.push({
                title: item.snippet.title,
                video_id: item.snippet.resourceId.videoId,
                publish_time: item.snippet.publishedAt
            })
        }
        
        nextPageToken = res.nextPageToken || null
        
        if (!nextPageToken) {
            break
        }
    }
            
    return videos
}

function isUrlAlreadyIndexed(url: string): boolean {
    return false
    // Implementation commented out as in original
}

const whisper = new SIWhisperModel('medium', 'whisper-medium')
const MAX_VIDEO_LENGTH_SECONDS = 60 * 1; // 1 minute
// const MAX_VIDEO_LENGTH_SECONDS = 60 * 60 * 1; // 1 hour

async function indexChannel(channelId: string, useOauth: boolean): Promise<void> {
    const channelVideos = await getChannelVideos(channelId)
    console.log(channelVideos.length)
    
    const s3 = new S3Storage()
    
    for (const [index, video] of channelVideos.entries()) {
        console.log(`video ${index}/${channelVideos.length}`)          
        const url = `https://www.youtube.com/watch?v=${video.video_id}`

        console.log(`Title: ${video.title}`)
        console.log(`Video ID: ${video.video_id}`)
        
        if (isUrlAlreadyIndexed(url)) {
            console.log(`Already in DB, SKIP INDEXING ${url}`)
            continue
        }

        for (let i = 0; i < 10; i++) {
            try {
                await new YoutubeProcessor({
                    s3,
                    whisper,
                    youtubeUrl: url,
                    useOauth
                })
                console.log("---")
                break
            } catch (error) {
                if (error.name === 'AgeRestrictedError') {
                    console.log("Age restricted -> SKIP")
                    break
                }
                if (i === 9) {
                    console.log("===================Failed after 10 retries", error)
                    console.error(error)
                }
            }
        }
    }
    
    await s3.close()
}

// Channel IDs
const CHANNEL_LE_BLOB = "UC3E2DhYIqnoc6H3WXwTVnlA"
const CHANNEL_CITE_DES_SCIENCES = "UC2RSe5ZktAjE3qoMKi2pA_g"
const CHANNEL_PALAIS_DE_LA_DECOUVERTE = "UC1udnO-W6gpR9qzleJ5SDKw"

const useOauth = false

async function main() {
    await indexChannel(CHANNEL_LE_BLOB, useOauth)
    await indexChannel(CHANNEL_CITE_DES_SCIENCES, useOauth)
    await indexChannel(CHANNEL_PALAIS_DE_LA_DECOUVERTE, useOauth)
}

main().catch(console.error)
