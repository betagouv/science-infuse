import { youtube, youtube_v3 } from '@googleapis/youtube';

/**
 * Standalone YouTube API testing functions
 * These functions don't depend on Prisma or other database operations
 */

const Youtube = youtube({
  version: 'v3',
  auth: process.env.YOUTUBE_API_KEY,
});

export interface VideoStatusResult {
  videoId: string;
  isAvailable: boolean;
  isPublic: boolean;
  error?: string;
}

/**
 * Check the status of a single YouTube video using the YouTube API
 * This is a standalone version that doesn't depend on Prisma
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
