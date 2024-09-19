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

    const chapters = await prisma.chapter.findMany({
      where: {
        themeId: params.id
      },
      include: {
        skills: true,
        educationLevels: true,
        blocks: true,
      }
    });

    if (!chapters) {
      return NextResponse.json({ error: 'Chapters not found' }, { status: 404 });
    }

    return NextResponse.json(chapters);
  } catch (error) {
    console.error('Error fetching course chapter:', error);
    return NextResponse.json({ error: 'Failed to fetch course chapter' }, { status: 500 });
  }
}
