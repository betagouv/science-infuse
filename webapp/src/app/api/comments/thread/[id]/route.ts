import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

// add comment
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const threadId = params.id;
    const { chapterId, message } = await request.json();
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    const newMessage = await prisma.comment.create({
      data: {
        commentThread: {
          connect: { id: threadId },
        },
        message: message,
        user: {
          connect: { id: session.user.id },
        },
      }
    })

    return NextResponse.json(newMessage);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create new message' }, { status: 500 });
  }
}


// get thread
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const threadId = params.id;

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const thread = await prisma.commentThread.findUnique({
      where: {
        id: threadId,
      },
      include: {
        comments: {
          include: {
            user: {
              select: {
                email: true
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    return NextResponse.json(thread);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch thread' }, { status: 500 });
  }
}
