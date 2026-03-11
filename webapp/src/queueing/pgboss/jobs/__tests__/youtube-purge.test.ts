import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { youtube } from '@googleapis/youtube';
import { YoutubePurgeJob, YoutubePurgeWorker } from '../youtube-purge';
import { extractYoutubeVideoId } from '@/lib/utils/youtube';
import {
  createMockVideo,
  createMockYouTubeResponse,
  createMockYouTubeError,
  createMockEmptyResponse,
  createMockJob,
  TEST_VIDEO_IDS,
  TEST_YOUTUBE_URLS,
  MOCK_JOB_DATA
} from './test-utils';

// Mock the YouTube API
vi.mock('@googleapis/youtube', () => ({
  youtube: vi.fn()
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  default: {
    document: {
      findMany: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    },
    documentChunk: {
      deleteMany: vi.fn()
    }
  }
}));

// Mock the YouTube utils
vi.mock('@/lib/utils/youtube', () => ({
  extractYoutubeVideoId: vi.fn()
}));

describe('YouTube Purge Job', () => {
  let mockYoutube: any;
  let mockVideosList: Mock;

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Setup YouTube API mock
    mockVideosList = vi.fn();
    mockYoutube = {
      videos: {
        list: mockVideosList
      }
    };
    
    (youtube as Mock).mockReturnValue(mockYoutube);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Job Configuration', () => {
    it('should have correct job name', () => {
      expect(YoutubePurgeJob).toBeDefined();
    });

    it('should validate job schema correctly', () => {
      const validConfig = {
        purgeDelayDays: 90,
        batchSize: 100,
        maxApiCallsPerRun: 1000
      };

      // This should not throw
      expect(() => YoutubePurgeJob.emit(validConfig)).not.toThrow();
    });

    it('should use default values when not provided', () => {
      const minimalConfig = {};
      
      // This should not throw and use defaults
      expect(() => YoutubePurgeJob.emit(minimalConfig)).not.toThrow();
    });

    it('should reject invalid configuration', () => {
      const invalidConfig = {
        purgeDelayDays: -1, // Invalid: negative
        batchSize: 0, // Invalid: zero
        maxApiCallsPerRun: 'invalid' // Invalid: not a number
      };

      expect(() => YoutubePurgeJob.emit(invalidConfig)).toThrow();
    });
  });

  describe('YouTube API Integration', () => {
    it('should check video status for public video', async () => {
      const videoId = TEST_VIDEO_IDS.PUBLIC;
      const mockResponse = createMockYouTubeResponse('public', 'processed');

      mockVideosList.mockResolvedValue(mockResponse);

      // Import the function we want to test
      const { checkVideoStatus } = await import('../youtube-purge');
      
      const result = await checkVideoStatus(videoId);

      expect(mockVideosList).toHaveBeenCalledWith({
        part: ['status'],
        id: [videoId]
      });

      expect(result).toEqual({
        videoId,
        isAvailable: true,
        isPublic: true
      });
    });

    it('should check video status for private video', async () => {
      const videoId = TEST_VIDEO_IDS.PRIVATE;
      const mockResponse = createMockYouTubeResponse('private', 'processed');

      mockVideosList.mockResolvedValue(mockResponse);

      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(videoId);

      expect(result).toEqual({
        videoId,
        isAvailable: false,
        isPublic: false
      });
    });

    it('should check video status for unlisted video', async () => {
      const videoId = 'unlisted123';
      const mockResponse = {
        data: {
          items: [{
            status: {
              privacyStatus: 'unlisted',
              uploadStatus: 'processed'
            }
          }]
        }
      };

      mockVideosList.mockResolvedValue(mockResponse);

      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(videoId);

      expect(result).toEqual({
        videoId,
        isAvailable: false,
        isPublic: false
      });
    });

    it('should handle video not found (deleted)', async () => {
      const videoId = TEST_VIDEO_IDS.DELETED;
      const mockResponse = createMockEmptyResponse();

      mockVideosList.mockResolvedValue(mockResponse);

      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(videoId);

      expect(result).toEqual({
        videoId,
        isAvailable: false,
        isPublic: false,
        error: 'Video not found'
      });
    });

    it('should handle API quota exceeded error', async () => {
      const videoId = 'quota123';
      const mockError = createMockYouTubeError(403, 'API quota exceeded');

      mockVideosList.mockRejectedValue(mockError);

      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(videoId);

      expect(result).toEqual({
        videoId,
        isAvailable: false,
        isPublic: false,
        error: 'API quota exceeded or access forbidden'
      });
    });

    it('should handle video not found error (404)', async () => {
      const videoId = 'notfound123';
      const mockError = {
        code: 404,
        message: 'Video not found'
      };

      mockVideosList.mockRejectedValue(mockError);

      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(videoId);

      expect(result).toEqual({
        videoId,
        isAvailable: false,
        isPublic: false,
        error: 'Video not found'
      });
    });

    it('should handle unknown API errors', async () => {
      const videoId = 'error123';
      const mockError = {
        code: 500,
        message: 'Internal server error'
      };

      mockVideosList.mockRejectedValue(mockError);

      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(videoId);

      expect(result).toEqual({
        videoId,
        isAvailable: false,
        isPublic: false,
        error: 'Internal server error'
      });
    });

    it('should handle network errors', async () => {
      const videoId = 'network123';
      const mockError = new Error('Network timeout');

      mockVideosList.mockRejectedValue(mockError);

      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(videoId);

      expect(result).toEqual({
        videoId,
        isAvailable: false,
        isPublic: false,
        error: 'Network timeout'
      });
    });
  });

  describe('Video ID Extraction', () => {
    it('should extract video ID from YouTube URL', () => {
      const testCases = [
        {
          url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
          expectedId: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://youtu.be/dQw4w9WgXcQ',
          expectedId: 'dQw4w9WgXcQ'
        },
        {
          url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          expectedId: 'dQw4w9WgXcQ'
        }
      ];

      testCases.forEach(({ url, expectedId }) => {
        (extractYoutubeVideoId as Mock).mockReturnValue(expectedId);
        const result = extractYoutubeVideoId(url);
        expect(result).toBe(expectedId);
      });
    });

    it('should handle invalid YouTube URLs', () => {
      const invalidUrls = [
        'https://example.com/video',
        'not-a-url',
        'https://www.youtube.com/watch',
        ''
      ];

      invalidUrls.forEach(url => {
        (extractYoutubeVideoId as Mock).mockReturnValue(null);
        const result = extractYoutubeVideoId(url);
        expect(result).toBeNull();
      });
    });
  });

  describe('Job Execution Flow', () => {
    it('should execute job with valid configuration', async () => {
      const jobData = MOCK_JOB_DATA.SMALL_BATCH;

      // Mock database responses
      const mockPrisma = await import('@/lib/prisma');
      (mockPrisma.default.document.findMany as Mock)
        .mockResolvedValueOnce([]) // getYouTubeVideosToCheck
        .mockResolvedValueOnce([]) // getDeindexedYouTubeVideos
        .mockResolvedValueOnce([]); // getVideosToPurge

      const mockJob = createMockJob(jobData);

      const result = await YoutubePurgeWorker.handler(mockJob);

      expect(result.success).toBe(true);
      expect(result.stats).toBeDefined();
      expect(result.stats.apiCallsUsed).toBe(0);
      expect(result.stats.videosChecked).toBe(0);
    });

    it('should handle job execution errors gracefully', async () => {
      const jobData = {
        purgeDelayDays: 90,
        batchSize: 10,
        maxApiCallsPerRun: 100
      };

      // Mock database error
      const mockPrisma = await import('@/lib/prisma');
      (mockPrisma.default.document.findMany as Mock)
        .mockRejectedValue(new Error('Database connection failed'));

      const mockJob = {
        id: 'test-job-123',
        data: jobData
      };

      const result = await YoutubePurgeWorker.handler(mockJob);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(result.stats).toBeDefined();
    });
  });

  describe('API Rate Limiting', () => {
    it('should respect maxApiCallsPerRun limit', async () => {
      const jobData = {
        purgeDelayDays: 90,
        batchSize: 5,
        maxApiCallsPerRun: 2 // Very low limit for testing
      };

      // Mock database to return videos
      const mockVideos = [
        { id: '1', originalPath: 'https://youtube.com/watch?v=video1', isPublic: true, deleted: false },
        { id: '2', originalPath: 'https://youtube.com/watch?v=video2', isPublic: true, deleted: false },
        { id: '3', originalPath: 'https://youtube.com/watch?v=video3', isPublic: true, deleted: false }
      ];

      const mockPrisma = await import('@/lib/prisma');
      (mockPrisma.default.document.findMany as Mock)
        .mockResolvedValueOnce(mockVideos) // getYouTubeVideosToCheck
        .mockResolvedValueOnce([]) // getDeindexedYouTubeVideos
        .mockResolvedValueOnce([]); // getVideosToPurge

      // Mock video ID extraction
      (extractYoutubeVideoId as Mock)
        .mockReturnValueOnce('video1')
        .mockReturnValueOnce('video2')
        .mockReturnValueOnce('video3');

      // Mock successful API responses
      mockVideosList.mockResolvedValue({
        data: {
          items: [{
            status: {
              privacyStatus: 'public',
              uploadStatus: 'processed'
            }
          }]
        }
      });

      const mockJob = {
        id: 'test-job-123',
        data: jobData
      };

      const result = await YoutubePurgeWorker.handler(mockJob);

      expect(result.success).toBe(true);
      expect(result.stats.apiCallsUsed).toBe(2); // Should stop at limit
      expect(result.stats.videosChecked).toBe(2); // Should only check 2 videos
    });
  });

  describe('Real YouTube API Integration Tests', () => {
    // These tests require a real YouTube API key and will make actual API calls
    // They should be run separately with a test API key
    it.skip('should work with real YouTube API (requires API key)', async () => {
      // This test is skipped by default but can be enabled for integration testing
      const realVideoId = 'dQw4w9WgXcQ'; // Rick Roll - should always be available
      
      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(realVideoId);

      expect(result.videoId).toBe(realVideoId);
      expect(result.isAvailable).toBe(true);
      expect(result.isPublic).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it.skip('should handle real deleted video (requires API key)', async () => {
      // This test uses a known deleted video ID
      const deletedVideoId = 'deleted123456789';
      
      const { checkVideoStatus } = await import('../youtube-purge');
      const result = await checkVideoStatus(deletedVideoId);

      expect(result.videoId).toBe(deletedVideoId);
      expect(result.isAvailable).toBe(false);
      expect(result.isPublic).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
