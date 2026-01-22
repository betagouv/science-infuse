import prisma from "@/lib/prisma";
import { DocumentChunk } from "@prisma/client";
import { callGroq } from "@/lib/server/ia/external_llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { documentId, context: providedContext } = await request.json();

    if (!documentId && !providedContext) {
      return NextResponse.json({ error: "documentId or context is required" }, { status: 400 });
    }

    let context = (providedContext as string | undefined) || "";

    if (!context) {
      const chunks: Pick<DocumentChunk, "text">[] = await prisma.documentChunk.findMany({
        where: { documentId },
        select: { text: true },
      });

      context = chunks.map((chunk) => chunk.text).join("\n\n");
    }

    if (!context.trim()) {
      return NextResponse.json({ error: "No content found for document" }, { status: 404 });
    }

    const numQuestions = 4 + Math.floor(Math.random() * 3); // 4-6 questions

    const prompt = `<context>${context}</context>

En te basant STRICTEMENT sur le <context>, génère EXACTEMENT ${numQuestions} questions de type "texte à trous" éducatives au format JSON valide (sans \`\`\` ou texte supplémentaire):

[
  {
    "text": "Phrase avec des *mots clés* à compléter",
    "tip": "Indice optionnel pour aider l'élève"
  }
]

Règles:
- Utilise des astérisques (*) pour entourer les mots à faire deviner
- Les mots entre astérisques seront transformés en champs de saisie
- Peux inclure plusieurs mots à compléter par phrase
- Ajoute des indices (tips) pertinents quand nécessaire
- Textes toujours en Français
- Pas de texte avant ou après le JSON
`;

    const [error, output] = await callGroq(prompt, "openai/gpt-oss-120b");

    if (error || !output) {
      throw new Error("LLM generation failed");
    }

    // Extract JSON array from output
    const jsonMatch = output.match(/\[[\s\S]*?\]/);
    if (!jsonMatch) {
      console.error("No valid JSON array in LLM output:", output);
      throw new Error("Invalid texte-a-trous format from LLM");
    }

    let questions;
    try {
      questions = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Empty or invalid array");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError, jsonMatch[0]);
      throw new Error("Failed to parse texte-a-trous JSON");
    }

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating texte-a-trous:", error);
    return NextResponse.json(
      { error: "An error occurred while generating texte-a-trous" },
      { status: 500 }
    );
  }
}
