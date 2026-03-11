#!/usr/bin/env ts-node

/**
 * Test script for YouTube API integration
 * This script tests the YouTube API functionality without running the full job
 * 
 * Usage:
 * 1. Set YOUTUBE_API_KEY environment variable
 * 2. Run: npx ts-node src/scripts/test-youtube-api.ts
 */

import { checkVideoStatus } from '../queueing/pgboss/jobs/__tests__/youtube-api-standalone';

const TEST_VIDEOS = [
  {
    id: 'dQw4w9WgXcQ',
    name: 'Rick Roll (should be public)',
    expected: { isAvailable: true, isPublic: true }
  },
  {
    id: 'nonexistent123456789',
    name: 'Non-existent video',
    expected: { isAvailable: false, isPublic: false }
  },
  {
    id: 'invalid-id-format',
    name: 'Invalid ID format',
    expected: { isAvailable: false, isPublic: false }
  }
];

async function testYouTubeAPI() {
  console.log('🧪 Testing YouTube API Integration...\n');

  if (!process.env.YOUTUBE_API_KEY) {
    console.error('❌ YOUTUBE_API_KEY environment variable is not set');
    console.log('Please set it with: export YOUTUBE_API_KEY="your-api-key"');
    process.exit(1);
  }

  if (process.env.YOUTUBE_API_KEY === 'test-api-key') {
    console.error('❌ Please set a real YouTube API key, not the test key');
    process.exit(1);
  }

  console.log(`✅ YouTube API Key found: ${process.env.YOUTUBE_API_KEY.substring(0, 10)}...\n`);

  let passedTests = 0;
  let totalTests = TEST_VIDEOS.length;

  for (const testVideo of TEST_VIDEOS) {
    console.log(`🔍 Testing: ${testVideo.name}`);
    console.log(`   Video ID: ${testVideo.id}`);
    
    try {
      const startTime = Date.now();
      const result = await checkVideoStatus(testVideo.id);
      const duration = Date.now() - startTime;

      console.log(`   Result: ${JSON.stringify(result, null, 2)}`);
      console.log(`   Duration: ${duration}ms`);

      // Check if result matches expectations
      const matchesExpected = 
        result.isAvailable === testVideo.expected.isAvailable &&
        result.isPublic === testVideo.expected.isPublic;

      if (matchesExpected) {
        console.log(`   ✅ PASS\n`);
        passedTests++;
      } else {
        console.log(`   ❌ FAIL - Expected: ${JSON.stringify(testVideo.expected)}, Got: ${JSON.stringify({
          isAvailable: result.isAvailable,
          isPublic: result.isPublic
        })}\n`);
      }

    } catch (error) {
      console.log(`   ❌ ERROR: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    }

    // Add delay between requests to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('📊 Test Results:');
  console.log(`   Passed: ${passedTests}/${totalTests}`);
  console.log(`   Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! YouTube API integration is working correctly.');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the results above.');
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the tests
testYouTubeAPI().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
