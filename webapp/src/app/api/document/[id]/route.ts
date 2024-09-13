import prisma from "@/lib/prisma";
import { ChunkData, TableOfContents, TOCItem } from "@/lib/types";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/authOptions";
import { getServerSession } from "next-auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);

    const id = params.id;

    if (!id) {
        return new Response('Missing document_uuid parameter', { status: 400 })
    }

    try {

        const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        if (user.email == "erwan.boehm@gmail.com") {

            await prisma.document.delete({
                where: { id: id }
            });

            return NextResponse.json({ message: 'Document and associated chunks deleted successfully' });
        }

        return NextResponse.json({ message: 'You are not allowed to delete a document' });
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'An error occurred' }, { status: 500 });
    }
}
