// app/api/course-chapters/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const chapter = await prisma.chapter.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!chapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
    }

    return NextResponse.json(chapter);
  } catch (error) {
    console.error('Error fetching course chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch course chapter' }, { status: 500 });
  }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
  ) {
    try {
      const session = await getServerSession(authOptions);
  
      if (!session || !session.user) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
  
      const { title, content } = await request.json();
  
      const updatedChapter = await prisma.chapter.update({
        where: {
          id: params.id,
          userId: session.user.id,
        },
        data: {
          title,
          content,
        },
      });
  
      return NextResponse.json(updatedChapter);
    } catch (error) {
      console.error('Error updating course chapter:', error);
      return NextResponse.json({ error: 'Failed to update course chapter' }, { status: 500 });
    }
  }