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

        const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const file = await prisma.file.findFirst({ where: { userId: user.id, id: params.id } });

        return NextResponse.json(file);
    } catch (error) {
        console.error('Error fetching files:', error);
        return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession(authOptions)

        const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { fileTypes, ...updateData } = await request.json()

        const file = await prisma.file.findUnique({
            where: { id: params.id, userId: user.id }
        })

        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 })
        }

        if (file.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const updatedFile = await prisma.file.update({
            where: { id: params.id },
            data: {
                ...updateData,
                ...(fileTypes && {
                    fileTypes: {
                        set: fileTypes.map((id: string) => ({ id }))
                    }
                })
            },
            include: { fileTypes: true }
        })
        return NextResponse.json(updatedFile)
    } catch (error) {
        console.error('Error updating file:', error)
        return NextResponse.json({ error: 'Failed to update file' }, { status: 500 })
    }
}
