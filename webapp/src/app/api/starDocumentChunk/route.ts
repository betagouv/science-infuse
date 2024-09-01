import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { DocumentChunk } from "@prisma/client";
import { ChunkWithScoreUnion } from "@/types/vectordb";

type GroupedFavorites = {
    [keyword: string]: (DocumentChunk & { user_starred: boolean })[];
};

export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const favoritesGroupedByKeyword = await prisma.starredDocumentChunk.findMany({
            where: {
                userId: user.id,
            },
            select: {
                keyword: true,
                documentChunk: {
                    include: {
                        document: true,
                        metadata: true,
                    },
                },
            },
        });

        const groupedFavorites: GroupedFavorites = favoritesGroupedByKeyword.reduce((acc, favorite) => {
            const { keyword, documentChunk } = favorite;
            if (!acc[keyword]) {
                acc[keyword] = [];
            }
            acc[keyword].push({ user_starred: true, ...documentChunk });
            return acc;
        }, {} as GroupedFavorites);



        return NextResponse.json(groupedFavorites)
    } catch (error) {
        console.error('error getting starred chunks:', error);
        return NextResponse.json({ error: 'error getting starred chunks' }, { status: 401 });
    }
}


export async function POST(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } });
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { keyword, documentChunkId } = await request.json();

        const favorite = await prisma.starredDocumentChunk.create({
            data: {
                keyword: keyword,
                userId: user.id,
                documentChunkId: documentChunkId,
            },
        });

        return NextResponse.json(favorite);
    } catch (error) {
        console.error('Error creating favorite:', error);
        return NextResponse.json({ error: 'Error creating favorite' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } });
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { documentChunkId } = await request.json();

        const deletedFavorite = await prisma.starredDocumentChunk.deleteMany({
            where: {
                userId: user.id,
                documentChunkId: documentChunkId,
            },
        });

        return NextResponse.json(deletedFavorite);
    } catch (error) {
        console.error('Error deleting favorite:', error);
        return NextResponse.json({ error: 'Error deleting favorite' }, { status: 500 });
    }
}

