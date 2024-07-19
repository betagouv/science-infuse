// app/api/course-chapters/[id]/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const chapter = await prisma.courseChapterBlock.findUnique({
      where: {
        id: params.id,
        authorId: session.user.id,
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

    const updatedChapter = await prisma.courseChapterBlock.update({
      where: {
        id: params.id,
        authorId: session.user.id,
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

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const deletedChapter = await prisma.courseChapterBlock.delete({
      where: {
        id: params.id,
        authorId: session.user.id,
      },
    })

    if (!deletedChapter) {
      return NextResponse.json({ error: 'Chapter not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Chapter deleted successfully' })
  } catch (error) {
    console.error('Error deleting course chapter:', error)
    return NextResponse.json({ error: 'Failed to delete course chapter' }, { status: 500 })
  }
}
