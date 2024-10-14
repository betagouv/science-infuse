import { withAccessControl } from '@/app/api/accessControl';
import prisma from '@/lib/prisma';
import { queue, queueManager } from '@/queueing/pgboss/boss';
import { indexFileJob } from '@/queueing/pgboss/jobs/index-file';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { states } from 'pg-boss';
import { PgBossJobGetIndexFileResponse, PgBossJobIndexFile } from './types';



export const GET = withAccessControl(
  { allowedRoles: ['ADMIN'] },
  async (request: NextRequest, { user }: { user: User }) => {
    try {
      const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
      const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '10');
      const offset = (page - 1) * pageSize;

      const [jobs, totalCount] = await Promise.all([
        prisma.$queryRaw<PgBossJobIndexFile[]>`
          SELECT 
            id,
            name,
            data,
            state,
            started_on,
            created_on,
            completed_on
          FROM captable_queue.job 
          WHERE name = 'data.index-file'
          ORDER BY created_on DESC
          LIMIT ${pageSize}
          OFFSET ${offset}
        `,
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) 
          FROM captable_queue.job 
          WHERE name = 'data.index-file'
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
      } as PgBossJobGetIndexFileResponse);
    } catch (error) {
      console.error('Error in GET request:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });