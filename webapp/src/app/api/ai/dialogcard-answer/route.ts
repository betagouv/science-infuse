import prisma from "@/lib/prisma";
import { DocumentChunk } from "@prisma/client";
import { callGroq } from "@/lib/server/ia/external_llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { question, documentId } = await request.json();

    if (!question?.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    let context = "";
    if (documentId) {
      const chunks: Pick<DocumentChunk, "text">[] = await prisma.documentChunk.findMany({
        where: { documentId },
        select: { text: true },
      });


      context = chunks.map((chunk) => chunk.text).join("\n\n");
    }

    if (!context.trim()) {
      // If no context, generate generic answer, but warn
      console.warn("No context provided, generating generic answer");
    }

    const prompt = `<context>${context}</context>

<question>${question}</question>

Fournis une réponse concise, précise et éducative à la <question>, en te basant STRICTEMENT sur le <context> fourni (si disponible). Si le contexte ne contient pas d'info pertinente, indique-le clairement.

Réponse directe sans introduction ni "Réponse:".`;

    const [error, output] = await callGroq(prompt);

    if (error || !output) {
      throw new Error("LLM generation failed");
    }

    // Clean output: trim and remove markdown if any
    const answer = output.trim().replace(/^Réponse\s*:\s*/i, '').replace(/```[\s\S]*?```/g, '').trim();

    if (!answer) {
      throw new Error("Empty answer from LLM");
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error generating dialogcard answer:", error);
    return NextResponse.json(
      { error: "An error occurred while generating answer" },
      { status: 500 }
    );
  }
}