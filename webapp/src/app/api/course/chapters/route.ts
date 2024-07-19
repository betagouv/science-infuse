// app/api/course-chapters/route.ts
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/authOptions';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { title, content } = await request.json();

    const courseChapter = await prisma.courseChapter.create({
      data: {
        title,
        content,
        author: {
          connect: { id: session.user.id },
        },
      },
    });

    return NextResponse.json(courseChapter, { status: 201 });
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

    const chapters = await prisma.courseChapter.findMany({
      where: {
        author: { id: session.user.id },
      },
    });

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching course chapters:', error);
    return NextResponse.json({ error: 'Failed to fetch course chapters' }, { status: 500 });
  }
}