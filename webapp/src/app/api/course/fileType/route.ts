// app/api/course-chapters/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/authOptions';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const fileTypes = await prisma.fileType.findMany();

    if (!fileTypes) {
      return NextResponse.json({ error: 'fileTypes not found' }, { status: 404 });
    }

    return NextResponse.json(fileTypes);
  } catch (error) {
    console.error('Error fetching file type:', error);
    return NextResponse.json({ error: 'Failed to fetch file type' }, { status: 500 });
  }
}
