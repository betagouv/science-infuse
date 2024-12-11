import { withAccessControl } from '@/app/api/accessControl';
import prisma from '@/lib/prisma';
import { PgBossJobGetIndexContentResponse, PgBossJobIndexContent } from '@/types/queueing';
import { User } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';



export const GET = withAccessControl(
  { allowedRoles: ['ADMIN'] },
  async (request: NextRequest, { user }: { user: User }) => {
    try {
      const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
      const pageSize = parseInt(request.nextUrl.searchParams.get('pageSize') || '10');
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
          WHERE name = 'data.index-content'
          ORDER BY created_on DESC
          LIMIT ${pageSize}
          OFFSET ${offset}
        `,
        prisma.$queryRaw<[{ count: bigint }]>`
          SELECT COUNT(*) 
          FROM captable_queue.job 
          WHERE name = 'data.index-content'
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