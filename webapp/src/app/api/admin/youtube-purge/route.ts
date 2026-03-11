import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { YoutubePurgeJob } from '@/queueing/pgboss/jobs/youtube-purge';
import { z } from 'zod';

const TriggerSchema = z.object({
  purgeDelayDays: z.number().min(1).max(365).default(90),
  batchSize: z.number().min(1).max(1000).default(100),
  maxApiCallsPerRun: z.number().min(1).max(10000).default(1000)
});

export async function POST(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const validatedData = TriggerSchema.parse(body);

    // Emit the job
    const jobId = await YoutubePurgeJob.emit(validatedData, { priority: 1 });

    return NextResponse.json({ 
      success: true, 
      jobId,
      message: 'YouTube purge job triggered successfully',
      config: validatedData
    });

  } catch (error) {
    console.error('Error triggering YouTube purge job:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid request data', 
        details: error.errors 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      error: 'Failed to trigger YouTube purge job' 
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'YouTube Purge Job API',
      endpoints: {
        POST: 'Trigger the YouTube purge job manually',
        parameters: {
          purgeDelayDays: 'Number of days to wait before purging deleted videos (1-365, default: 90)',
          batchSize: 'Number of videos to process per batch (1-1000, default: 100)',
          maxApiCallsPerRun: 'Maximum YouTube API calls per job run (1-10000, default: 1000)'
        }
      },
      schedule: {
        frequency: 'Weekly',
        cron: '0 2 * * 0 (Every Sunday at 2 AM)',
        defaultConfig: {
          purgeDelayDays: 90,
          batchSize: 100,
          maxApiCallsPerRun: 1000
        }
      }
    });

  } catch (error) {
    console.error('Error in YouTube purge API:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
