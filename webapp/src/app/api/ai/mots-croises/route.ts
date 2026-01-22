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

    const numWords = 6 + Math.floor(Math.random() * 4); // 6-9 words

    const prompt = `<context>${context}</context>

En te basant STRICTEMENT sur le <context>, génère EXACTEMENT ${numWords} mots et définitions pour un jeu de mots croisés éducatifs au format JSON valide (sans \`\`\` ou texte supplémentaire):

[
  {
    "answer": "MOT",
    "clue": "Définition ou indice pour trouver ce mot"
  }
]

Règles:
- Les mots doivent être des concepts scientifiques clés du contexte
- Les définitions doivent être précises et éducatives
- Les mots doivent avoir des lettres en commun pour former un vrai jeu de mots croisés
- Longueur des mots: 4-12 caractères
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
      throw new Error("Invalid mots-croises format from LLM");
    }

    let words;
    try {
      words = JSON.parse(jsonMatch[0]);
      if (!Array.isArray(words) || words.length === 0) {
        throw new Error("Empty or invalid array");
      }
    } catch (parseError) {
      console.error("JSON parse error:", parseError, jsonMatch[0]);
      throw new Error("Failed to parse mots-croises JSON");
    }

    return NextResponse.json({ words });
  } catch (error) {
    console.error("Error generating mots-croises:", error);
    return NextResponse.json(
      { error: "An error occurred while generating mots-croises" },
      { status: 500 }
    );
  }
}
