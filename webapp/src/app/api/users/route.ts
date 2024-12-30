import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { User } from 'next-auth';
import { userFullFields, withAccessControl } from '../accessControl';
import { UserFullWithChapterCount } from '@/types/api';


export const GET = withAccessControl(
    { allowedRoles: ['ADMIN'] },
    async (request: NextRequest, { params, user }: { params: { id: string }, user: User }) => {
        try {
            const users = await prisma.user.findMany({
                select: {
                    ...userFullFields,
                    _count: {
                        select: {
                            chapters: true
                        }
                    }
                },
            });

            const usersWithChapterCount: UserFullWithChapterCount[] = users.map(user => ({
                ...user,
                chapterCount: user._count.chapters
            }));

            return NextResponse.json(usersWithChapterCount);
        } catch (error) {
            console.error('Error fetching users:', error);
            return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
        }
    },
)