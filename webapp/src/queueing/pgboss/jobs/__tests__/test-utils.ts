import { Mock } from 'vitest';

/**
 * Test utilities for YouTube Purge Job tests
 */

export interface MockVideoData {
  id: string;
  originalPath: string;
  isPublic: boolean;
  deleted: boolean;
}

export interface MockYouTubeApiResponse {
  data: {
    items: Array<{
      status?: {
        privacyStatus: 'public' | 'private' | 'unlisted';
        uploadStatus: 'processed' | 'uploaded' | 'deleted';
      };
    }>;
  };
}

export interface MockYouTubeApiError {
  code: number;
  message: string;
}

/**
 * Creates mock video data for testing
 */
export function createMockVideo(overrides: Partial<MockVideoData> = {}): MockVideoData {
  return {
    id: 'test-video-id',
    originalPath: 'https://www.youtube.com/watch?v=test123',
    isPublic: true,
    deleted: false,
    ...overrides
  };
}

/**
 * Creates mock YouTube API response
 */
export function createMockYouTubeResponse(
  privacyStatus: 'public' | 'private' | 'unlisted' = 'public',
  uploadStatus: 'processed' | 'uploaded' | 'deleted' = 'processed'
): MockYouTubeApiResponse {
  return {
    data: {
      items: [{
        status: {
          privacyStatus,
          uploadStatus
        }
      }]
    }
  };
}

/**
 * Creates mock YouTube API error
 */
export function createMockYouTubeError(code: number, message: string): MockYouTubeApiError {
  return { code, message };
}

/**
 * Creates mock empty YouTube API response (video not found)
 */
export function createMockEmptyResponse(): MockYouTubeApiResponse {
  return {
    data: {
      items: []
    }
  };
}

/**
 * Test video IDs for different scenarios
 */
export const TEST_VIDEO_IDS = {
  PUBLIC: 'dQw4w9WgXcQ', // Rick Roll - should always be public
  PRIVATE: 'private123',
  DELETED: 'deleted123',
  INVALID: 'invalid-id-format',
  NONEXISTENT: 'nonexistent123456789'
} as const;

/**
 * Test YouTube URLs for different formats
 */
export const TEST_YOUTUBE_URLS = {
  STANDARD: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  SHORT: 'https://youtu.be/dQw4w9WgXcQ',
  EMBED: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  WITH_PARAMS: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=10s',
  INVALID: 'https://example.com/video',
  EMPTY: ''
} as const;

/**
 * Mock job data for testing
 */
export const MOCK_JOB_DATA = {
  DEFAULT: {
    purgeDelayDays: 90,
    batchSize: 100,
    maxApiCallsPerRun: 1000
  },
  SMALL_BATCH: {
    purgeDelayDays: 30,
    batchSize: 10,
    maxApiCallsPerRun: 50
  },
  LARGE_BATCH: {
    purgeDelayDays: 180,
    batchSize: 500,
    maxApiCallsPerRun: 5000
  }
} as const;

/**
 * Creates a mock job object for testing
 */
export function createMockJob(data: any = MOCK_JOB_DATA.DEFAULT) {
  return {
    id: 'test-job-123',
    data
  };
}

/**
 * Waits for a specified number of milliseconds
 * Useful for testing async operations
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Asserts that a mock was called with specific arguments
 */
export function expectMockCalledWith(mock: Mock, ...args: any[]) {
  expect(mock).toHaveBeenCalledWith(...args);
}

/**
 * Asserts that a mock was called a specific number of times
 */
export function expectMockCalledTimes(mock: Mock, times: number) {
  expect(mock).toHaveBeenCalledTimes(times);
}

/**
 * Asserts that a mock was not called
 */
export function expectMockNotCalled(mock: Mock) {
  expect(mock).not.toHaveBeenCalled();
}
