import { z } from "zod";
import { youtube, youtube_v3 } from '@googleapis/youtube';
import { defineJob, defineWorker, defineWorkerConfig } from "../boss";
import prisma from "@/lib/prisma";
import { extractYoutubeVideoId } from "@/lib/utils/youtube";

const config = defineWorkerConfig({
  name: "scheduled.youtube-purge",
  schema: z.object({
    purgeDelayDays: z.number().default(90),
    batchSize: z.number().default(100),
    maxApiCallsPerRun: z.number().default(1000)
  }),
});

export const YoutubePurgeJob = defineJob(config);

const Youtube = youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

interface VideoStatusResult {
  videoId: string;
  isAvailable: boolean;
  isPublic: boolean;
  error?: string;
}

/**
 * Check the status of a single YouTube video using the YouTube API
 */
export async function checkVideoStatus(videoId: string): Promise<VideoStatusResult> {
  try {
    const response = await Youtube.videos.list({
      part: ['status'],
      id: [videoId]
    });

    const video = response.data.items?.[0];
    
    if (!video) {
      return {
        videoId,
        isAvailable: false,
        isPublic: false,
        error: 'Video not found'
      };
    }

    const status = video.status;
    const isPublic = status?.privacyStatus === 'public';
    const isAvailable = status?.uploadStatus === 'processed' && isPublic;

    return {
      videoId,
      isAvailable,
      isPublic,
    };
  } catch (error: any) {
    console.error(`Error checking video ${videoId}:`, error.message);
    
    // Handle specific API errors
    if (error.code === 403) {
      return {
        videoId,
        isAvailable: false,
        isPublic: false,
        error: 'API quota exceeded or access forbidden'
      };
    }
    
    if (error.code === 404) {
      return {
        videoId,
        isAvailable: false,
        isPublic: false,
        error: 'Video not found'
      };
    }

    return {
      videoId,
      isAvailable: false,
      isPublic: false,
      error: error.message || 'Unknown error'
    };
  }
}

/**
 * Get all YouTube videos from the database that need to be checked
 * This includes videos from YouTube URLs and local videos with a youtubeId
 */
async function getYouTubeVideosToCheck(batchSize: number): Promise<Array<{
  id: string;
  originalPath: string;
  youtubeId: string | null;
  isPublic: boolean;
  deleted: boolean;
}>> {
  return await prisma.document.findMany({
    where: {
      OR: [
        // Videos from YouTube URLs
        {
          source: 'YouTube',
          originalPath: {
            contains: 'youtube.com'
          }
        },
        // Local videos with a youtubeId
        {
          youtubeId: {
            not: null
          }
        }
      ]
    },
    select: {
      id: true,
      originalPath: true,
      youtubeId: true,
      isPublic: true,
      deleted: true
    },
    take: batchSize
  });
}

/**
 * Get videos that were previously deindexed and might need to be reindexed
 * This includes videos from YouTube URLs and local videos with a youtubeId
 */
async function getDeindexedYouTubeVideos(batchSize: number): Promise<Array<{
  id: string;
  originalPath: string;
  youtubeId: string | null;
}>> {
  return await prisma.document.findMany({
    where: {
      OR: [
        // Videos from YouTube URLs
        {
          source: 'YouTube',
          originalPath: {
            contains: 'youtube.com'
          }
        },
        // Local videos with a youtubeId
        {
          youtubeId: {
            not: null
          }
        }
      ],
      deleted: true,
      isPublic: false
    },
    select: {
      id: true,
      originalPath: true,
      youtubeId: true
    },
    take: batchSize
  });
}

/**
 * Get videos that have been deleted for more than the specified number of days
 * This includes videos from YouTube URLs and local videos with a youtubeId
 */
async function getVideosToPurge(purgeDelayDays: number): Promise<Array<{
  id: string;
  originalPath: string;
  youtubeId: string | null;
}>> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - purgeDelayDays);

  return await prisma.document.findMany({
    where: {
      OR: [
        // Videos from YouTube URLs
        {
          source: 'YouTube'
        },
        // Local videos with a youtubeId
        {
          youtubeId: {
            not: null
          }
        }
      ],
      deleted: true,
      isPublic: false,
      deletedAt: {
        not: null,
        lte: cutoffDate
      }
    },
    select: {
      id: true,
      originalPath: true,
      youtubeId: true
    }
  });
}

/**
 * Update video status in the database
 */
async function updateVideoStatus(
  documentId: string, 
  isPublic: boolean, 
  isAvailable: boolean
): Promise<void> {
  const updateData: any = {
    isPublic: isPublic && isAvailable,
    deleted: !isAvailable
  };

  // Set deletedAt timestamp when marking as deleted
  if (!isAvailable) {
    updateData.deletedAt = new Date();
  } else {
    // Clear deletedAt when reindexing (video becomes available again)
    updateData.deletedAt = null;
  }

  await prisma.document.update({
    where: { id: documentId },
    data: updateData
  });
}

/**
 * Physically delete a document and its related data
 */
async function purgeDocument(documentId: string): Promise<void> {
  // Delete in the correct order due to foreign key constraints
  await prisma.documentChunk.deleteMany({
    where: { documentId }
  });

  await prisma.document.delete({
    where: { id: documentId }
  });
}

/**
 * Add a small delay to respect API rate limits
 */
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const YoutubePurgeWorker = defineWorker(config, async (job) => {
  const { purgeDelayDays, batchSize, maxApiCallsPerRun } = job.data;
  const timestamp = new Date().toISOString();
  
  console.log(`[${timestamp}] Starting YouTube Purge Job with config:`, {
    purgeDelayDays,
    batchSize,
    maxApiCallsPerRun
  });

  let apiCallsUsed = 0;
  let videosChecked = 0;
  let videosDeindexed = 0;
  let videosReindexed = 0;
  let videosPurged = 0;

  try {
    // Step 1: Check currently indexed videos
    console.log('Step 1: Checking currently indexed YouTube videos...');
    const videosToCheck = await getYouTubeVideosToCheck(batchSize);
    
    for (const video of videosToCheck) {
      if (apiCallsUsed >= maxApiCallsPerRun) {
        console.log(`Reached API call limit (${maxApiCallsPerRun}), stopping for this run`);
        break;
      }

      // Use youtubeId if available, otherwise extract from originalPath
      const videoId = video.youtubeId || extractYoutubeVideoId(video.originalPath);
      if (!videoId) {
        console.warn(`Could not extract video ID from: ${video.originalPath}`);
        continue;
      }

      const status = await checkVideoStatus(videoId);
      apiCallsUsed++;
      videosChecked++;

      // Update database if status changed
      const shouldBePublic = status.isPublic && status.isAvailable;
      const shouldBeDeleted = !status.isAvailable;

      if (video.isPublic !== shouldBePublic || video.deleted !== shouldBeDeleted) {
        await updateVideoStatus(video.id, status.isPublic, status.isAvailable);
        
        if (shouldBeDeleted && !video.deleted) {
          videosDeindexed++;
          console.log(`Deindexed video: ${video.youtubeId ? `youtubeId: ${video.youtubeId}` : video.originalPath} (${status.error || 'unavailable'})`);
        }
      }

      // Small delay to respect rate limits
      await delay(100);
    }

    // Step 2: Check previously deindexed videos (might be available again)
    console.log('Step 2: Checking previously deindexed videos...');
    const deindexedVideos = await getDeindexedYouTubeVideos(batchSize);
    
    for (const video of deindexedVideos) {
      if (apiCallsUsed >= maxApiCallsPerRun) {
        console.log(`Reached API call limit (${maxApiCallsPerRun}), stopping for this run`);
        break;
      }

      // Use youtubeId if available, otherwise extract from originalPath
      const videoId = video.youtubeId || extractYoutubeVideoId(video.originalPath);
      if (!videoId) {
        continue;
      }

      const status = await checkVideoStatus(videoId);
      apiCallsUsed++;

      // If video is available again, reindex it
      if (status.isAvailable && status.isPublic) {
        await updateVideoStatus(video.id, status.isPublic, status.isAvailable);
        videosReindexed++;
        console.log(`Reindexed video: ${video.youtubeId ? `youtubeId: ${video.youtubeId}` : video.originalPath}`);
      }

      await delay(100);
    }

    // Step 3: Purge old deleted videos
    console.log('Step 3: Purging old deleted videos...');
    const videosToPurge = await getVideosToPurge(purgeDelayDays);
    
    for (const video of videosToPurge) {
      try {
        await purgeDocument(video.id);
        videosPurged++;
        console.log(`Purged video: ${video.youtubeId ? `youtubeId: ${video.youtubeId}` : video.originalPath}`);
      } catch (error) {
        console.error(`Error purging video ${video.id}:`, error);
      }
    }

    const result = {
      success: true,
      timestamp,
      stats: {
        apiCallsUsed,
        videosChecked,
        videosDeindexed,
        videosReindexed,
        videosPurged
      }
    };

    console.log(`[${timestamp}] YouTube Purge Job completed:`, result);
    return result;

  } catch (error) {
    console.error(`[${timestamp}] YouTube Purge Job failed:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
      stats: {
        apiCallsUsed,
        videosChecked,
        videosDeindexed,
        videosReindexed,
        videosPurged
      }
    };
  }
});
