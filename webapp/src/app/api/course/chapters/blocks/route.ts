import { NextResponse } from 'next/server';
import { CreateChapterBlockRequest } from '@/types/api';
import prisma from '@/lib/prisma';
import { Block } from '@prisma/client';
import { auth } from '@/auth';

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { title, content, chapterId }: CreateChapterBlockRequest = await request.json();

    const chapter = await prisma.chapter.findUnique({ where: { id: chapterId } });
    if (!chapter) {
      throw new Error(`CourseChapter with id ${chapterId} not found`);
    }

    const block = await prisma.block.create({
      data: {
        title,
        content,
        chapter: {
          connect: { id: chapterId }
        },
        user: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json<Block>(block, { status: 201 });
  } catch (error) {
    console.error('Error creating course chapter:', error);
    return NextResponse.json({ error: 'Failed to create course chapter' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const chaptersBlocks = await prisma.block.findMany({
      where: {
        user: { id: session.user.id },
      },
    });

    return NextResponse.json(chaptersBlocks);
  } catch (error) {
    console.error('Error fetching course chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch course chapters' }, { status: 500 });
  }
}