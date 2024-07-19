// app/api/course-chapters/route.ts
import { NextResponse } from 'next/server';
import { CourseChapterBlock, PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { CreateCourseChapterBlockRequest } from '@/types/api/courseChapter';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { title, content, chapterId }: CreateCourseChapterBlockRequest = await request.json();

    const chapter = await prisma.courseChapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
      throw new Error(`CourseChapter with id ${chapterId} not found`);
    }

    console.log("CREATE ", title, content, chapterId, session.user.id)
    const courseChapterBlock = await prisma.courseChapterBlock.create({
      data: {
        title,
        content,
        courseChapter: {
          connect: { id: chapterId }
        },
        author: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(courseChapterBlock, { status: 201 });
  } catch (error) {
    console.error('Error creating course chapter:', error);
    return NextResponse.json({ error: 'Failed to create course chapter' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const chaptersBlocks = await prisma.courseChapterBlock.findMany({
      where: {
        author: { id: session.user.id },
      },
    });

    return NextResponse.json(chaptersBlocks);
  } catch (error) {
    console.error('Error fetching course chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch course chapters' }, { status: 500 });
  }
}