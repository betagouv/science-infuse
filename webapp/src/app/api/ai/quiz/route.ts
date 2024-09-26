import { OLLAMA_URL } from "@/config";
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";


export async function POST(request: NextRequest): Promise<NextResponse<string | { error: string }>> {
    try {
        const { context } = await request.json()
        try {
            const prompt = `<context>${context}</context>
en te basant sur le <context> propose un qcm avec 4 choix par questions sous la forme suivante:
\`\`\`qcm
[
    {
        "question": "{the question}",
        "options": [
            {
                "answer": "reponse a", "correct": false
            },
            {
                "answer": "reponse b", "correct": false
            },
            {
                "answer": "reponse c", "correct": true
            },
            {
                "answer": "reponse d", "correct": true
            }
        ]
    },...
]
\`\`\``
            const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
                // model: 'llama3.2:3b',
                model: 'llama3.1:8b',
                stream: false,
                prompt: prompt
            })
            if (response.data && response.data.response) {
                const output = response.data.response
                const startIndex = output.indexOf('[')
                const endIndex = output.lastIndexOf(']')
                if (startIndex !== -1 && endIndex !== -1) {
                    return NextResponse.json(output.substring(startIndex, endIndex + 1).trim())
                } else {
                    throw new Error('Invalid QCM format in Ollama response')
                }

            } else {
                throw new Error('No response received from Ollama')
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Ollama query error:', error.response?.data || error.message)
                throw new Error(`Ollama query failed: ${error.response?.data?.error || error.message}`)
            } else {
                console.error('Unexpected error:', error)
                throw new Error('An unexpected error occurred during Ollama query')
            }
        }
    } catch (error) {
        console.error('Error processing request:', error)
        return NextResponse.json({ error: 'An error occurred while processing the request' }, { status: 500 })
    }
}