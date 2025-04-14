import { withAccessControl } from '@/app/api/accessControl';
import prisma from '@/lib/prisma';
import { autoIndexYoutubeWorker } from '@/queueing/pgboss/jobs/index-contents/auto-index-youtube';
import { IndexContentWorker } from '@/queueing/pgboss/jobs/index-contents/index-content';
import { ReindexYoutubeWorker } from '@/queueing/pgboss/jobs/reindex-youtube';
import { PgBossJobGetIndexContentResponse, PgBossJobIndexContent } from '@/types/queueing';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';



import { z } from 'zod';

const querySchema = z.object({
  queue: z.enum([IndexContentWorker.name, autoIndexYoutubeWorker.name, ReindexYoutubeWorker.name]).optional(),
  page: z.string().default('1'),
  pageSize: z.string().default('10')
});

export const GET = withAccessControl(
  { allowedRoles: ['ADMIN'] },
  async (request: NextRequest, { user }: { user: User }) => {
    try {
      const result = querySchema.safeParse({
        queue: request.nextUrl.searchParams.get('queue'),
        page: request.nextUrl.searchParams.get('page'),
        pageSize: request.nextUrl.searchParams.get('pageSize')
      });

      if (!result.success) {
        return NextResponse.json({ error: 'Invalid queue parameter' }, { status: 400 });
      }

      const queue = result.data.queue;
      const page = parseInt(result.data.page);
      const pageSize = parseInt(result.data.pageSize);
      const offset = (page - 1) * pageSize;

      const [jobs, totalCount] = await Promise.all([
        prisma.$queryRaw<PgBossJobIndexContent[]>`
          SELECT 
            id,
            name,
            data,
            output,
            state,
            started_on,
            created_on,
            completed_on
          FROM captable_queue.job 
          WHERE name = ${queue}
          ORDER BY created_on DESC
          LIMIT ${pageSize}
          OFFSET ${offset}
        `,
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) 
          FROM captable_queue.job 
          WHERE name = ${queue}
        `
      ]);

      const totalPages = Math.ceil(Number(totalCount[0].count) / pageSize);

      return NextResponse.json({
        jobs,
        pagination: {
          currentPage: page,
          totalPages,
          pageSize,
          totalCount: Number(totalCount[0].count)
        }
      } as PgBossJobGetIndexContentResponse);
    } catch (error) {
      console.error('Error in GET request:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });