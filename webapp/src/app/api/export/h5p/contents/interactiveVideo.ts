"use server";

import prisma from "@/lib/prisma";
import { PrismaClient } from "@prisma/client";

import Groq from 'groq-sdk';

const groqClient = new Groq({
    apiKey: process.env['GROQ_API_KEY'],
});


const callGroq = async (text: string, model: string = "llama-3.3-70b-versatile") => {
    const chatCompletion = await groqClient.chat.completions.create({
        messages: [{ role: 'user', content: text }],
        model: model,
    });

    return chatCompletion.choices[0].message.content;
}

export interface InteractiveVideoAnswer {
    answer: string;
    correct: boolean;
}

export interface InteractiveVideoQuestion {
    question: string;
    answers: InteractiveVideoAnswer[];
}

export interface InteractiveVideoQuestionGroup {
    timestamp: number;
    questions: InteractiveVideoQuestion[];
}


export interface InteractiveVideoDefinition {
    notion: string,
    definition: string
}
export interface InteractiveVideoDefinitionGroup {
    timestamp: number;
    definitions: InteractiveVideoDefinition[];
}

export interface InteractiveVideoData {
    videoPublicUrl: string,
    videoTitle: string,
    questions: InteractiveVideoQuestionGroup[],
    definitions: InteractiveVideoDefinitionGroup[],
}
const parseVideoContent = (input: string): {
    questions: InteractiveVideoQuestionGroup[],
    definitions: InteractiveVideoDefinitionGroup[]
} => {
    const lines = input.split('\n').filter(line => line.trim());
    const questionMap = new Map<number, InteractiveVideoQuestion[]>();
    const definitionMap = new Map<number, InteractiveVideoDefinition[]>();

    let currentQuestion: InteractiveVideoQuestion | null = null;

    lines.forEach(line => {
        const definitionMatch = line.match(/^timestamp \[(\d+); (\d+)\] => \| (.+?) \| (.+)$/);
        if (definitionMatch) {
            const [, , timestamp, notion, definition] = definitionMatch;
            const endTimestamp = parseInt(timestamp, 10);

            if (!definitionMap.has(endTimestamp)) {
                definitionMap.set(endTimestamp, []);
            }

            definitionMap.get(endTimestamp)?.push({
                notion: notion.trim(),
                definition: definition.trim()
            });
            return;
        }

        const timestampMatch = line.match(/^(?:\d+\) )?timestamp \[(\d+); (\d+)\] => (.+)$/);
        const answerMatch = line.match(/^([A-D])\) ([*|X]) (.+)$/);

        if (timestampMatch) {
            const [, , timestamp, questionText] = timestampMatch;
            const endTimestamp = parseInt(timestamp, 10);

            if (!questionMap.has(endTimestamp)) {
                questionMap.set(endTimestamp, []);
            }

            currentQuestion = {
                question: questionText.trim(),
                answers: []
            };

            questionMap.get(endTimestamp)?.push(currentQuestion);
        } else if (answerMatch && currentQuestion) {
            const [, , correctness, text] = answerMatch;
            currentQuestion.answers.push({
                answer: text.trim(),
                correct: correctness === '*'
            });
        }
    });

    // Filter questions without answers
    questionMap.forEach((questions, timestamp) => {
        questionMap.set(timestamp, questions.filter(q => q.answers.length > 0));
    });

    const questions = mergeCloseQuestions(
        Array.from(questionMap.entries())
            .filter(([, questions]) => questions.some(q => q.answers.length > 0))
            .map(([timestamp, questions]) => ({
                timestamp,
                questions: questions.filter(q => q.answers.length > 0)
            })),
        30
    );

    const definitions = mergeCloseDefinitions(
        Array.from(definitionMap.entries())
            .map(([timestamp, definitions]) => ({
                timestamp,
                definitions
            })),
        30
    );

    return { questions, definitions };
};

const mergeCloseQuestions = (
    groups: InteractiveVideoQuestionGroup[],
    timeThreshold: number
): InteractiveVideoQuestionGroup[] => {
    if (groups.length === 0) return [];

    const sortedGroups = [...groups].sort((a, b) => a.timestamp - b.timestamp);
    const mergedGroups: InteractiveVideoQuestionGroup[] = [sortedGroups[0]];

    for (let i = 1; i < sortedGroups.length; i++) {
        const current = sortedGroups[i];
        const previous = mergedGroups[mergedGroups.length - 1];

        if (current.timestamp - previous.timestamp <= timeThreshold) {
            previous.questions.push(...current.questions);
            previous.timestamp = current.timestamp;
        } else {
            mergedGroups.push(current);
        }
    }

    return mergedGroups;
};

const mergeCloseDefinitions = (
    groups: InteractiveVideoDefinitionGroup[],
    timeThreshold: number
): InteractiveVideoDefinitionGroup[] => {
    if (groups.length === 0) return [];

    const sortedGroups = [...groups].sort((a, b) => a.timestamp - b.timestamp);
    const mergedGroups: InteractiveVideoDefinitionGroup[] = [sortedGroups[0]];

    for (let i = 1; i < sortedGroups.length; i++) {
        const current = sortedGroups[i];
        const previous = mergedGroups[mergedGroups.length - 1];

        if (current.timestamp - previous.timestamp <= timeThreshold) {
            previous.definitions.push(...current.definitions);
            previous.timestamp = current.timestamp;
        } else {
            mergedGroups.push(current);
        }
    }

    return mergedGroups;
};


export const generateInteraciveVideoData = async (videoDocumentId: string) => {
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
La transcription est découpée en paragraphes avec un horodatage.
Le but est de vérifier via des Quiz que le spectateur de la vidéo à bien compris les notions **scientifiques** abordées dans cette vidéo.
Pour chaque paragraphe contenant des **informations pertinentes**: 
1) identifie les information scientifiques importante et propose un QCU (questionnaire a choix unique). Il ne doit y avoir qu'une seule réponse correcte par question.
2) identifie les mots clés scientifiques pertinents dont la définition est donnée dans la transcription, et réecris la transcription.

Voici un exemple de réponse attendue :
\`\`\`
questions:
timestamp [start; end] => Mettre ici la question pour le paragraphe 2
A) * Réponse A correcte
B) X Réponse B
C) X Réponse C
D) X Réponse D

definitions:
timestamp [start; end] => | mot clé | définition du mot clé dans la vidéo

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

    const response = await callGroq(prompt)
    if (response) {
        const { questions, definitions } = parseVideoContent(response);

        return {
            questions: questions,
            videoTitle: video?.mediaName,
            videoPublicUrl: `https://science-infuse.beta.gouv.fr/api/s3/presigned_url/object_name/${video?.s3ObjectName}`,
            definitions: definitions,
        } as InteractiveVideoData;
    }

}
