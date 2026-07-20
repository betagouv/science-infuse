import { callGroq } from "@/lib/server/ia/external_llm";
import { getContext } from "@/lib/server/context-helper";
import { NextRequest, NextResponse } from "next/server";

const MAX_QUESTION_LENGTH = 2000;
const configuredContextLength = Number.parseInt(process.env.LLM_MAX_CONTEXT_LENGTH || "", 10);
const MAX_CONTEXT_LENGTH = Number.isFinite(configuredContextLength) && configuredContextLength > 0
  ? Math.min(configuredContextLength, 10000)
  : 10000;
const MAX_ANSWER_TOKENS = 512;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { question, documentId, chunkId, additionalContext } = await request.json();

    if (typeof question !== "string" || !question.trim()) {
      return NextResponse.json({ error: "question is required" }, { status: 400 });
    }

    if (question.length > MAX_QUESTION_LENGTH) {
      return NextResponse.json(
        { error: `question must be at most ${MAX_QUESTION_LENGTH} characters` },
        { status: 400 }
      );
    }

    const hasAdditionalContext = typeof additionalContext === "string" && Boolean(additionalContext.trim());
    const hasContextSource = Boolean(documentId || chunkId || hasAdditionalContext);
    const context = hasContextSource
      ? await getContext({
          documentId,
          chunkId,
          additionalContext,
          maxTextLength: MAX_CONTEXT_LENGTH,
        })
      : "";

    if (!context) {
      // If no context, generate generic answer, but warn
      console.warn("No context provided, generating generic answer");
    }

    const prompt = `<context>${context}</context>

<question>${question}</question>

Fournis une réponse concise, précise et éducative à la <question>, en te basant STRICTEMENT sur le <context> fourni (si disponible). Si le contexte ne contient pas d'info pertinente, indique-le clairement.

Réponse directe sans introduction ni "Réponse:".`;

    const [error, output] = await callGroq(prompt, "llama-3.3-70b-versatile", MAX_ANSWER_TOKENS);

    if (error) {
      console.error("Groq failed to generate dialogcard answer:", error);
      const responseStatus = error.status === 413 || error.status === 429 ? error.status : 502;
      return NextResponse.json(
        {
          error: error.status === 413
            ? "The context is too large to generate an answer"
            : error.status === 429
              ? "Too many answers are being generated. Please try again shortly"
            : "The answer generation service is temporarily unavailable",
        },
        { status: responseStatus }
      );
    }

    if (!output) {
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
