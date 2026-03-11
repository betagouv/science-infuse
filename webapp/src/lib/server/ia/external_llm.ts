"use server";

import prisma from '@/lib/prisma';
import Groq from 'groq-sdk';

const groqClient = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});


export interface GroqError {
    status: number;
    message: string;
}

export const callGroq = async (text: string, model: string = "llama-3.3-70b-versatile"): Promise<[GroqError | undefined, string | undefined]> => {
    const chatCompletion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: text }],
        model: model,
    }).catch((err) => {
        if (err instanceof Groq.APIError) {
            console.log(err.status);
            console.log(err.name);
            console.log(err.headers);
            return [{ status: err.status, message: err.name } as GroqError, undefined];
        } else {
            throw err;
        }
    });
    if (!chatCompletion) {
        return [undefined, undefined];
    }
    if (Array.isArray(chatCompletion)) {
        return chatCompletion as [GroqError, undefined];
    }

    console.log(chatCompletion.choices[0].message.content);
    return [undefined, chatCompletion.choices[0].message.content || ""];
}


export const LLMGenerateDefinition = async (notion: string, documentId?: string) => {
    let context = "";
    const document = await prisma.document.findUnique({ where: { id: documentId }, include: { documentChunks: true } })
    if (document) {
        const relevantChunk = document.documentChunks.filter(chunk =>
            chunk.text.toLowerCase().includes(notion.toLowerCase())
        );
        context = (relevantChunk.length ? relevantChunk : document.documentChunks).map(chunk => chunk.text).join('\n');
        context = context.slice(0, 2000);
    }

    return await callGroq(`Génère une définition simple et courte du mot suivant : "${notion}".\n${context ? `Le mot est utilisé dans le contexte suivant: \`\`\`${context}\`\`\`` : ""}\nRépond uniquement par la définition. ${context?'Si le contexte ne mentionne pas le mot à définir, propose une définition simple du mot.': ''}`);

}