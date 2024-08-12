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

    const block = await prisma.block.findUnique({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!block) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 });
    }

    return NextResponse.json(block);
  } catch (error) {
    console.error('Error fetching course Block:', error);
    return NextResponse.json({ error: 'Failed to fetch Block' }, { status: 500 });
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

    const { title, content, keyIdeas } = await request.json();
    console.log("SAVE BLOCKKKKK", title, "\n", content, "\n", keyIdeas)

    const updatedBlock = await prisma.block.update({
      where: {
        id: params.id,
        userId: session.user.id,
      },
      data: {
        title,
        content,
        keyIdeas: {
          set: keyIdeas.map((id: string) => ({ id })),
        },

      },
    });

    return NextResponse.json(updatedBlock);
  } catch (error) {
    console.error('Error updating block:', error);
    return NextResponse.json({ error: 'Failed to update block' }, { status: 500 });
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

    const deletedBlock = await prisma.block.delete({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!deletedBlock) {
      return NextResponse.json({ error: 'Block not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Block deleted successfully' })
  } catch (error) {
    console.error('Error deleting block:', error)
    return NextResponse.json({ error: 'Failed to delete block' }, { status: 500 })
  }
}
