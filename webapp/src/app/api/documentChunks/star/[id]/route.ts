import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";


export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } });
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { keyword } = await request.json();

        const favorite = await prisma.starredDocumentChunk.create({
            data: {
                keyword: keyword,
                userId: user.id,
                documentChunkId: params.id,
            },
        });

        return NextResponse.json(favorite);
    } catch (error) {
        console.error('Error creating favorite:', error);
        return NextResponse.json({ error: 'Error creating favorite' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } });
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {

        const deletedFavorite = await prisma.starredDocumentChunk.deleteMany({
            where: {
                userId: user.id,
                documentChunkId: params.id,
            },
        });

        return NextResponse.json(deletedFavorite);
    } catch (error) {
        console.error('Error deleting favorite:', error);
        return NextResponse.json({ error: 'Error deleting favorite' }, { status: 500 });
    }
}

