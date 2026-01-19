import { callGroq } from "@/lib/server/ia/external_llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { text, documentId } = await request.json();

    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const prompt = `Texte: "${text}"

Génère un indice court et utile pour aider à compléter ce texte à trous. L'indice doit être en français, concis et pertinent. Ne donne que l'indice, sans autre texte.`;

    const [error, output] = await callGroq(prompt, "openai/gpt-oss-120b");

    if (error || !output) {
      throw new Error("LLM generation failed");
    }

    return NextResponse.json({ answer: output.trim() });
  } catch (error) {
    console.error("Error generating texte-a-trous answer:", error);
    return NextResponse.json(
      { error: "An error occurred while generating texte-a-trous answer" },
      { status: 500 }
    );
  }
}