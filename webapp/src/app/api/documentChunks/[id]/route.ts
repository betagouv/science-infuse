import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    // const session = await getServerSession(authOptions);
    // const user = await prisma.user.findUnique({ where: { id: session?.user?.id } });
    // if (!user) {
    //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    try {

        const chunk = await prisma.documentChunk.findUnique({
            where: { id: params.id },
            include: {
                metadata: true,
                document: true,
            }
        })

        return NextResponse.json(chunk);
    } catch (error) {
        console.error('Error getting chunk:', error);
        return NextResponse.json({ error: 'Error getting chunk' }, { status: 500 });
    }
}