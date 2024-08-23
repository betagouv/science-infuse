import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

// add comment
export async function POST(
  request: Request,
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { chapterId } = await request.json();
    const commentThread = await prisma.commentThread.create({
      data: {
        chapter: {
          connect: { id: chapterId },
        }
      },
    });

    return NextResponse.json(commentThread);
  } catch (error) {
    console.error('Error creating thread:', error);
    return NextResponse.json({ error: 'Failed to create new thread' }, { status: 500 });
  }
}
