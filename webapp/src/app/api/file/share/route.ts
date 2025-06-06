import { v4 as uuidv4 } from 'uuid'
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { File } from '@prisma/client';
import { auth } from '@/auth';

interface UpdateFileRequest {
  s3ObjectName: string;
  shared: boolean;
}

interface UpdateFileResponse extends File { }


export async function POST(request: NextRequest): Promise<NextResponse<UpdateFileResponse | { error: string }>> {
  try {
    const { s3ObjectName, shared }: UpdateFileRequest = await request.json();
    const file = await prisma.file.findFirst({
      where: {
        s3ObjectName: s3ObjectName
      }
    });
    if (file) {
      const updatedImage = await prisma.file.update({
        where: { id: file.id },
        data: { shared },
      });
      return NextResponse.json(updatedImage);
    }
    return NextResponse.json({ error: "file not found" }, { status: 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update image' }, { status: 500 });
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<boolean | { error: string }>> {
  try {
    const session = await auth();
    if (!session?.user?.id)
      return NextResponse.json({ error: "file not fuound" }, { status: 404 });
    const { searchParams } = new URL(request.url);
    const s3ObjectName = searchParams.get('s3ObjectName') || "";
    const image = await prisma.file.findFirst({
      where: { s3ObjectName, userId: session?.user.id },
    });
    return NextResponse.json(image?.shared || false);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch images' }, { status: 500 });
  }
}