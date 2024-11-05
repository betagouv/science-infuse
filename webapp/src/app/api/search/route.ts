import { NextRequest, NextResponse } from "next/server";
import { searchBlocksWithChapter, searchDocumentChunks } from "./sql_raw_queries";
import { getServerSession } from "next-auth";
import prisma from "@/lib/prisma";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { getEmbeddings } from "@/lib/utils/getEmbeddings";
import { QueryRequest } from "@/types/api";


export async function POST(request: NextRequest): Promise<NextResponse<any | { error: string }>> {
    const session = await getServerSession(authOptions);
    const user = await prisma.user.findUnique({ where: { id: session?.user?.id } })
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const params = await request.json() as QueryRequest;
        console.log("PARAMS, ", params)
        const embeddings = await getEmbeddings(params.query)

        const chunks = await searchDocumentChunks(user.id, embeddings, params)
        const blocks = await searchBlocksWithChapter(user.id, embeddings, params.query, true);
        return NextResponse.json({ page_count: 1, chunks, blocks })
    } catch (error) {
        console.log("ERRRRROR", error)
        return NextResponse.json({ error: `unable to search` }, { status: 500 })
    }
}