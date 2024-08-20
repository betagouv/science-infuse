import { OLLAMA_URL } from "@/config";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest): Promise<NextResponse<string | { error: string }>> {
    try {
        const { context } = await request.json()
        const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
            model: 'llama3.1:8b',
            stream: false,
            prompt: `Act as a completion assistant. I will give you a start of text, and you will answer with the continuation of the sentence without adding extra context. Do not repeat the sentence I give you. Only continue from where it stops. If the last word is cut, just complete it without adding any additional explanation or content.
  For example if i give you '''i love my ca''' you answer '''ts''' to form '''i love my cats'''
  Text to complete:
  \`\`\`
  ${context}
  \`\`\`
  `})
        if (response.data && response.data.response) {
            return NextResponse.json(response.data.response)
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