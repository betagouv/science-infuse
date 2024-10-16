import { NEXT_PUBLIC_SERVER_URL, OLLAMA_URL } from "@/config";
import prisma from "@/lib/prisma";
import { TextWithScore } from "@/types/api";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'
export async function POST(request: NextRequest): Promise<NextResponse<TextWithScore[] | { error: string }>> {
    try {
        const { context } = await request.json()
        const _kis = await prisma.keyIdea.findMany();
        const kis = _kis.map(ki => ki.title)
        const response = await axios.post(`${NEXT_PUBLIC_SERVER_URL}/rerank/text`, {
            texts: kis,
            query: context
        })
        console.log("RESPONSE DATA", response.data)
        if (response.data) {
            return NextResponse.json(response.data)
        } else {
            return NextResponse.json({ error: "No response generated" }, { status: 500 })
        }

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Ollama query error:', error.response?.data || error.message)
        } else {
            console.error('Unexpected error:', error)
        }
        return NextResponse.json({ error: "Unable to generate completion" }, { status: 500 })
    }
}