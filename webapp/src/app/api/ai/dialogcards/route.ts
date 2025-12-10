import prisma from "@/lib/prisma";
import { DocumentChunk } from "@prisma/client";
import { callGroq } from "@/lib/server/ia/external_llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { documentId } = await request.json();

    if (!documentId) {
      return NextResponse.json({ error: "documentId is required" }, { status: 400 });
    }

    const chunks: Pick<DocumentChunk, "text">[] = await prisma.documentChunk.findMany({
      where: { documentId },
      select: { text: true },
    });


    const context = chunks.map((chunk) => chunk.text).join("\n\n");

    if (!context.trim()) {
      return NextResponse.json({ error: "No content found for document" }, { status: 404 });
    }

    const numCards = 6 + Math.floor(Math.random() * 4); // 6-9 cards

    const prompt = `<context>${context}</context>

En te basant STRICTEMENT sur le <context>, génère EXACTEMENT ${numCards} dialogcards éducatives au format JSON valide (sans \` \`\` ou texte supplémentaire):

[
  {
    "question": "Question claire et précise sur un concept clé",
    "answer": "Réponse concise, complète et directement tirée du contexte"
  }
]

Règles:
- Questions ouvertes, couvrant les points scientifiques essentiels.
- Réponses factuelles, sans invention.
- Pas de texte avant ou après le JSON.
`;

    const [error, output] = await callGroq(prompt, "openai/gpt-oss-120b");

    if (error || !output) {
      throw new Error("LLM generation failed");
    }

    // Extract JSON array from output
    const jsonMatch = output.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.error("No valid JSON array in LLM output:", output);
      throw new Error("Invalid dialogcards format from LLM");
    }

    let dialogcards;
    try {
      dialogcards = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(dialogcards) || dialogcards.length === 0) {
        throw new Error("Empty or invalid array");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError, jsonMatch[0]);
      throw new Error("Failed to parse dialogcards JSON");
    }

    return NextResponse.json({ cards: dialogcards });
  } catch (error) {
    console.error("Error generating dialogcards:", error);
    return NextResponse.json(
      { error: "An error occurred while generating dialogcards" },
      { status: 500 }
    );
  }
}