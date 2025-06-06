import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    // const session = await auth();
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