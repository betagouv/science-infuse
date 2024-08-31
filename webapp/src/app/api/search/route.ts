import { NEXT_PUBLIC_SERVER_URL, OLLAMA_URL } from "@/config";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { searchDocumentChunks } from "./sql_raw_queries";


export async function POST(request: NextRequest): Promise<NextResponse<any | { error: string }>> {
    try {
        const { query } = await request.json()
        const embeddingResponse = await axios.post(`${NEXT_PUBLIC_SERVER_URL}/embedding/`, {
            text: query
        })
        const embedding = embeddingResponse.data

        const chunks = await searchDocumentChunks(embedding)
        return NextResponse.json({ page_count: 1, chunks })


        // if (response.data && response.data.response) {
        //     return NextResponse.json(response.data.response)
        // } else {
        //     return NextResponse.json({ error: "No response generated" }, { status: 500 })
        // }

    } catch (error) {
        console.log("ERRRRROR", error)
        return NextResponse.json({ error: `unable to search` }, { status: 500 })
    }
}