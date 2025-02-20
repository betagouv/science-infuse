import { z } from "zod";
import { youtube, youtube_v3 } from '@googleapis/youtube';
import { defineJob, defineWorker, defineWorkerConfig } from "../boss";
import { indexContentJob } from "./index-contents";
import { IndexingContentType } from "@/types/queueing";


const config = defineWorkerConfig({
  name: "scheduled.reindex-youtube",
  schema: z.object({}),
});

export const ReindexYoutubeJob = defineJob(config);

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

async function runChannelIndexation(channelId: string): Promise<void> {
  const channelVideos = await getChannelVideos(channelId)
  console.log(channelVideos.length)

  for (const [index, video] of Array.from(channelVideos.entries())) {
    const url = `https://www.youtube.com/watch?v=${video.video_id}`

    await indexContentJob.emit({
      path: url,
      sourceCreationDate: video.publish_time ? new Date(video.publish_time) : undefined,
      type: IndexingContentType.youtube,
      documentTagIds: [],
      isExternal: false,
      metadata: {
        channelName: video.channel_name,
      },
      author: 'Universcience'
    },
      { priority: 0 }
    )
  }
}

const CHANNEL_LE_BLOB = "UC3E2DhYIqnoc6H3WXwTVnlA"
const CHANNEL_CITE_DES_SCIENCES = "UC2RSe5ZktAjE3qoMKi2pA_g"
const CHANNEL_PALAIS_DE_LA_DECOUVERTE = "UC1udnO-W6gpR9qzleJ5SDKw"


export const ReindexYoutubeWorker = defineWorker(config, async (job) => {
  const timestamp = new Date().toISOString();

  await runChannelIndexation(CHANNEL_LE_BLOB)
  await runChannelIndexation(CHANNEL_CITE_DES_SCIENCES)
  await runChannelIndexation(CHANNEL_PALAIS_DE_LA_DECOUVERTE)

  console.log(`[${timestamp}] ReindexYoutubeJob - Job ID: ${job.id}`);
  return { success: true };
});

