import { getContext } from "@/lib/server/context-helper";
import { callGroq } from "@/lib/server/ia/external_llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { documentId, chunkId } = await request.json();

    if (!documentId && !chunkId) {
      return NextResponse.json({ error: "documentId or chunkId is required" }, { status: 400 });
    }

    const context = await getContext({ documentId, chunkId });

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
- Réponses factuelles, sans invention, toujours en Français.
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
