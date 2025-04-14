import { z } from "zod";
import { youtube, youtube_v3 } from '@googleapis/youtube';
import { defineJob, defineWorker, defineWorkerConfig } from "../boss";
import { autoIndexYoutubeJob } from "./index-contents/auto-index-youtube";
import prisma from "@/lib/prisma";
import { createOrGetTag } from "./index-video";
import { videoIdToYoutubeUrl } from "@/scripts/reindex-youtube";


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
  const publicChannelVideos = await getChannelVideos(channelId)
  console.log(publicChannelVideos.length)
  if (publicChannelVideos.length === 0) {
    return
  }
  const channelTag = await createOrGetTag(publicChannelVideos[0].channel_name)

  // all video of this channel currently indexed in the Ada Database
  const currentDbChhannelVideos = await prisma.document.findMany({
    where: {
      tags: {
        some: {
          id: {
            equals: channelTag
          }
        }
      }
    }
  })

  // all videos that were indexed in the Ada database for this channel, but that are no more public since last indexing job (no more returned by getChannelVideos)
  const noMorePublicVideos = currentDbChhannelVideos.filter(video => !publicChannelVideos.some(channelVideo => videoIdToYoutubeUrl(channelVideo.video_id) === video.originalPath))
  // hide noMorePublicVideos in db
  await prisma.document.updateMany({
    where: {
      id: {
        in: noMorePublicVideos.map(video => video.id)
      }
    },
    data: {
      isPublic: false
    }
  })

  console.log("NO MORE PUBLIC VIDEOS", noMorePublicVideos)


  // now we can proceed to emit indexation jobs for all the publicChannelVideos
  for (const [index, video] of Array.from(publicChannelVideos.entries())) {
    const url = videoIdToYoutubeUrl(video.video_id)
    let fileHash: string = video.video_id;

    await autoIndexYoutubeJob.emit({
      url: url,
      sourceCreationDate: video.publish_time ? new Date(video.publish_time) : undefined,
      documentTagIds: [channelTag],
      fileHash,
      metadata: {
        channelName: video.channel_name,
      },
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

