import { PrismaClient } from "@prisma/client";

import Groq from 'groq-sdk';

const client = new Groq({
    apiKey: process.env['GROQ_API_KEY'], // This is the default and can be omitted
});


const prisma = new PrismaClient();

// const videoDocumentId = "8757d5e7-89c4-4b29-82b0-615277a4562c"
const videoDocumentId = "b4a06fc9-db93-42df-8e75-48e52e3df162"


const callGroq = async (text: string, model: string = "llama-3.3-70b-versatile") => {
    const chatCompletion = await client.chat.completions.create({
        messages: [{ role: 'user', content: text }],
        model: model,
    });

    return chatCompletion.choices[0].message.content;
}

interface Answer {
    answer: string;
    correct: boolean;
}

interface Question {
    question: string;
    answers: Answer[];
}

interface QuestionGroup {
    timestamp: number;
    questions: Question[];
}

const parseQuestions = (input: string): QuestionGroup[] => {
    const lines = input.split('\n').filter(line => line.trim());
    const groupedQuestions = new Map<number, Question[]>();

    let currentQuestion: Question | null = null;

    lines.forEach(line => {
        const timestampMatch = line.match(/^timestamp \[(\d+); (\d+)\] => (.+)$/);
        const answerMatch = line.match(/^([A-D])\) ([*|X]) (.+)$/);

        if (timestampMatch) {
            const endTimestamp = parseInt(timestampMatch[2], 10);

            if (!groupedQuestions.has(endTimestamp)) {
                groupedQuestions.set(endTimestamp, []);
            }

            currentQuestion = {
                question: timestampMatch[3].trim(),
                answers: []
            };

            groupedQuestions.get(endTimestamp)?.push(currentQuestion);
        } else if (answerMatch && currentQuestion) {
            const [, , correctness, text] = answerMatch;
            currentQuestion.answers.push({
                answer: text.trim(),
                correct: correctness === '*'
            });
        }
    });

    return Array.from(groupedQuestions.entries()).map(([timestamp, questions]) => ({
        timestamp,
        questions
    }));
}

const main = async () => {
    const video = await prisma.document.findUnique({
        where: {
            id: videoDocumentId
        },
        include: {
            documentChunks: {
                include: {
                    metadata: true
                }
            }
        }
    })
    const chunks = (video?.documentChunks || []).sort((a, b) => (a.metadata?.start || 0) - (b.metadata?.start || 0))
    const videoTranscript = chunks.map((chunk, i) => `timestamp [${(chunk.metadata?.start || 0).toFixed()}; ${(chunk.metadata?.end || 0).toFixed()}] => ${chunk.text}\n---------\n`).join('')
    const prompt = `
Voici la transcription d'une vidéo scientifique dont le titre est "${video?.mediaName}".
La transcription est découpée en paragraphes numérotés : 1), 2), ...
Le but est de vérifier via des quiz que le spectateur de la vidéo à bien compris les notions **scientifiques** abordées dans cette vidéo.
Pour chaque paragraphe contenant des **informations pertinentes**, identifie les information scientifiques importante et propose un QCM (questionnaire a choix multiple).
Voici un exemple de réponse attendue :
\`\`\`
timestamp [start; end] => Mettre ici la question pour le paragraphe 2
A) * Réponse A correcte
B) X Réponse B
C) X Réponse C
D) X Réponse D
\`\`\`
Mets un astérix (*) devant les réponses correctes et un X devant les réponses fausses.
Les questions et les réponses sont courtes.
Les questions doivent se baser uniquement sur le contenu de la vidéo. N'essaie pas d'inventer, base toi uniquement sur les informations contenues dans la transcription. Si un paragraphe ne contient pas d'information importante, ne produit pas de QCM.
Tu peux faire un QCM basé sur plusieurs paragraphes. Dans ce cas la indique le dernier paragraphe.
Fais bien attention à répondre en français, sans fautes d'orthographe.

Transcription de la vidéo:
\`\`\`
${videoTranscript}
\`\`\`

`.trim()
    console.log(prompt)
    console.log("\n\n=============\n\n")

    const response = await callGroq(prompt)
    if (response)
        console.log(parseQuestions(response).map(qg => `${qg.timestamp} \n${JSON.stringify(qg.questions)}\n\n`))

}

main()



prisma.$disconnect()