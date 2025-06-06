import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic'
export async function GET(
  request: Request,
) {
  try {
    const session = await auth();

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
