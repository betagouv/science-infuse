import { callGroq } from "@/lib/server/ia/external_llm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { answer, documentId } = await request.json();

    if (!answer) {
      return NextResponse.json({ error: "answer is required" }, { status: 400 });
    }

    const prompt = `Mot: "${answer}"

Génère une définition courte et éducative pour ce mot dans un jeu de mots croisés. La définition doit être en français, claire et pertinente pour un contexte pédagogique. Ne donne que la définition, sans autre texte.`;

    const [error, output] = await callGroq(prompt, "openai/gpt-oss-120b");

    if (error || !output) {
      throw new Error("LLM generation failed");
    }

    return NextResponse.json({ clue: output.trim() });
  } catch (error) {
    console.error("Error generating mots-croises clue:", error);
    return NextResponse.json(
      { error: "An error occurred while generating mots-croises clue" },
      { status: 500 }
    );
  }
}