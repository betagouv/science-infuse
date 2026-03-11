import { describe, it, expect, beforeAll } from 'vitest';
import { checkVideoStatus } from './youtube-api-standalone';

/**
 * Integration tests for YouTube API
 * These tests require a real YouTube API key and will make actual API calls
 * 
 * To run these tests:
 * 1. Set YOUTUBE_API_KEY environment variable with a valid API key
 * 2. Run: npm run test:integration
 * 
 * Note: These tests are skipped by default to avoid API quota usage
 */

describe('YouTube Purge Job - Integration Tests', () => {
  const hasRealApiKey = process.env.YOUTUBE_API_KEY && process.env.YOUTUBE_API_KEY !== 'test-api-key';
  
  beforeAll(() => {
    if (!hasRealApiKey) {
      console.log('⚠️  Skipping integration tests - no real YouTube API key provided');
      console.log('   Set YOUTUBE_API_KEY environment variable to run integration tests');
    } else {
      console.log('✅ YouTube API key found, running integration tests...');
    }
  });

  describe('Real YouTube API Tests', () => {
    it('should check status of a known public video', async () => {
      // Skip if no real API key
      if (!hasRealApiKey) {
        console.log('⏭️  Skipping test - no real API key');
        return;
      }

      // Rick Roll - should always be available and public
      const videoId = 'dQw4w9WgXcQ';
      
      const result = await checkVideoStatus(videoId);
      console.log({result});
      expect(result.videoId).toBe(videoId);
      expect(result.isAvailable).toBe(true);
      expect(result.isPublic).toBe(true);
      expect(result.error).toBeUndefined();
    }, 10000); // 10 second timeout for API call

    it('should handle a non-existent video ID', async () => {
      // Skip if no real API key
      if (!hasRealApiKey) {
        console.log('⏭️  Skipping test - no real API key');
        return;
      }

      // Use a clearly non-existent video ID
      const videoId = 'nonexistent123456789';
      
      const result = await checkVideoStatus(videoId);
      console.log({result});

      expect(result.videoId).toBe(videoId);
      expect(result.isAvailable).toBe(false);
      expect(result.isPublic).toBe(false);
      expect(result.error).toBeDefined();
    }, 10000);

    it('should handle invalid video ID format', async () => {
      // Skip if no real API key
      if (!hasRealApiKey) {
        console.log('⏭️  Skipping test - no real API key');
        return;
      }

      // Use an invalid video ID format
      const videoId = 'invalid-id-format';
      
      const result = await checkVideoStatus(videoId);
      console.log({result});
      expect(result.videoId).toBe(videoId);
      expect(result.isAvailable).toBe(false);
      expect(result.isPublic).toBe(false);
      expect(result.error).toBeDefined();
    }, 10000);

    it('should handle API quota exceeded scenario', async () => {
      // Skip if no real API key
      if (!hasRealApiKey) {
        console.log('⏭️  Skipping test - no real API key');
        return;
      }

      // This test might fail if quota is actually exceeded
      // It's more of a demonstration of how the function handles errors
      const videoId = 'dQw4w9WgXcQ';
      
      const result = await checkVideoStatus(videoId);
      console.log({result});
      // Should either succeed or fail gracefully
      expect(result.videoId).toBe(videoId);
      expect(typeof result.isAvailable).toBe('boolean');
      expect(typeof result.isPublic).toBe('boolean');
    }, 10000);
  });

  describe('API Response Validation', () => {
    it('should validate API response structure', async () => {
      // Skip if no real API key
      if (!hasRealApiKey) {
        console.log('⏭️  Skipping test - no real API key');
        return;
      }

      const videoId = 'dQw4w9WgXcQ';
      const result = await checkVideoStatus(videoId);
      console.log({result});
      // Validate response structure
      expect(result).toHaveProperty('videoId');
      expect(result).toHaveProperty('isAvailable');
      expect(result).toHaveProperty('isPublic');
      
      expect(typeof result.videoId).toBe('string');
      expect(typeof result.isAvailable).toBe('boolean');
      expect(typeof result.isPublic).toBe('boolean');
      
      if (result.error) {
        expect(typeof result.error).toBe('string');
      }
    }, 10000);
  });
});
