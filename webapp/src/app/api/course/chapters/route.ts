// app/api/course-chapters/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { title, content } = await request.json();

    const chapter = await prisma.chapter.create({
      data: {
        title,
        content,
        user: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(chapter, { status: 201 });
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

    const chapters = await prisma.chapter.findMany({
      where: {
        user: { id: session.user.id },
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching course chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch course chapters' }, { status: 500 });
  }
}