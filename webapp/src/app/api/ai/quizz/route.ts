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

    const numQuestions = 6 + Math.floor(Math.random() * 4); // 6-9 questions

    const prompt = `<context>${context}</context>

En te basant STRICTEMENT sur le <context>, génère EXACTEMENT ${numQuestions} questions de quiz éducatives.

Format JSON requis:
[{"question":"Question?","options":[{"answer":"A","correct":true},{"answer":"B","correct":false},{"answer":"C","correct":false},{"answer":"D","correct":false}]}]

Règles:
- 4 options par question, une seule correcte
- Questions scientifiques en français
- JSON valide uniquement

Génère ${numQuestions} questions:`;

    console.log("Calling LLM with prompt length:", prompt.length);
    const [error, output] = await callGroq(prompt, "openai/gpt-oss-120b");

    if (error || !output) {
      console.error("LLM generation failed:", error);
      throw new Error(`LLM generation failed: ${error?.message || 'Unknown error'}`);
    }

    console.log("LLM output received, length:", output.length);
    console.log("Raw LLM output:", output.substring(0, 200) + "...");

    // Try multiple approaches to extract JSON
    let jsonStr = output;
    
    // Try to find JSON array
    const jsonMatch = output.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
      console.log("Found JSON array match");
    }
    
    // Clean up common LLM formatting issues
    jsonStr = jsonStr.replace(/```json/g, '');
    jsonStr = jsonStr.replace(/```/g, '');
    jsonStr = jsonStr.trim();

    console.log("Cleaned JSON string:", jsonStr.substring(0, 200) + "...");

    let questions;
    try {
      questions = JSON.parse(jsonStr);
      console.log("Successfully parsed JSON, questions count:", questions.length);
      
      // Validate structure
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Empty or invalid array");
      }
      
      // Validate each question has required structure
      for (const q of questions) {
        if (!q.question || !q.options || !Array.isArray(q.options) || q.options.length !== 4) {
          console.error("Invalid question structure:", q);
          throw new Error(`Invalid question structure: missing question, options, or wrong option count`);
        }
        
        // Count correct answers
        const correctCount = q.options.filter((opt: any) => opt.correct === true).length;
        if (correctCount !== 1) {
          console.error("Wrong correct answer count:", correctCount, "for question:", q);
          throw new Error(`Each question must have exactly one correct answer, found ${correctCount}`);
        }
      }
      
      console.log("All questions validated successfully");
      
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw output:", output);
      console.error("Cleaned JSON:", jsonStr);
      
      // Try a simpler fallback approach
      return NextResponse.json({
        error: "Failed to generate valid quiz format. Please try again.",
        debug: {
          message: parseError instanceof Error ? parseError.message : 'Unknown parse error',
          rawOutput: output.substring(0, 300),
          cleanedJson: jsonStr.substring(0, 300)
        }
      }, { status: 500 });
    }

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error generating quiz:", error);
    
    // Return more detailed error information for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Try a simple fallback quiz if LLM fails
    console.log("Attempting fallback quiz generation...");
    const fallbackQuestions = [
      {
        question: "Quel est le concept principal abordé dans ce document?",
        options: [
          { answer: "Le concept principal", correct: true },
          { answer: "Un concept secondaire", correct: false },
          { answer: "Une idée non mentionnée", correct: false },
          { answer: "Un détail mineur", correct: false }
        ]
      }
    ];
    
    return NextResponse.json(
      {
        error: "An error occurred while generating quiz",
        details: errorMessage,
        debug: {
          message: errorMessage,
          fallback: "Using simple fallback quiz"
        },
        questions: fallbackQuestions
      },
      { status: 500 }
    );
  }
}
