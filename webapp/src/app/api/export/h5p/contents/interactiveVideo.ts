"use server";

import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import prisma from "@/lib/prisma";
import { ServerProcessingResult } from "@/queueing/pgboss/jobs/index-contents";
import { WordSegment } from "@/types/vectordb";
import { DocumentChunk, Document, DocumentChunkMeta, PrismaClient } from "@prisma/client";
import axios from "axios";

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


function findFirstWordOccurrence(
    chunks: (DocumentChunk & { metadata: DocumentChunkMeta | null })[],
    searchPhrase: string
): number | null {
    if (!searchPhrase) return null;

    // Split the phrase into words and normalize each
    const searchWords = searchPhrase.split(' ').map(normalize);

    for (const chunk of chunks) {
        if (!chunk?.metadata?.word_segments) continue;
        const segments = chunk.metadata.word_segments as unknown as WordSegment[];

        // Try every possible starting index in the segments
        for (let i = 0; i < segments.length; i++) {
            let segIndex = i;
            let allWordsMatched = true;
            let lastSegmentEnd = 0;

            // For each expected word from the search phrase…
            for (const searchWord of searchWords) {
                let candidate = '';
                let matched = false;

                // Accumulate segments until candidate equals or overshoots searchWord.
                while (segIndex < segments.length) {
                    if (!segments[segIndex]?.text) {
                        segIndex++;
                        continue;
                    }
                    candidate += normalize(segments[segIndex].text);
                    lastSegmentEnd = segments[segIndex].end;
                    segIndex++;

                    if (candidate === searchWord) {
                        matched = true;
                        break;
                    }
                    // If candidate is longer than expected, no need to add more segments.
                    if (candidate.length >= searchWord.length) {
                        break;
                    }
                }

                if (!matched) {
                    allWordsMatched = false;
                    break;
                }
            }

            if (allWordsMatched) {
                // Return the end time of the last segment that was part of the match.
                return lastSegmentEnd;
            }
        }
    }
    return null;
}


// Helper function to normalize text (assuming you have one)
function normalize(text: string): string {
    if (!text) return '';
    return text.trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/g, '');
}
const parseVideoContent = (input: string, chunks: (DocumentChunk & { metadata: DocumentChunkMeta | null })[]): {
    questions: InteractiveVideoQuestionGroup[],
    definitions: InteractiveVideoDefinitionGroup[]
} => {

    if (chunks.length <= 0) return {
        questions: [],
        definitions: []
    }

    const lines = input.split('\n').filter(line => line.trim());
    const questionMap = new Map<number, InteractiveVideoQuestion[]>();
    const definitionMap = new Map<number, InteractiveVideoDefinition[]>();

    let currentQuestion: InteractiveVideoQuestion | null = null;

    lines.forEach(line => {
        const definitionMatch = line.match(/^timestamp \[(\d+); (\d+)\] => \| (.+?) \| (.+)$/);
        if (definitionMatch) {
            const [, , timestamp, notion, definition] = definitionMatch;
            const endTimestamp = parseInt(timestamp, 10);
            const wordOccurence = findFirstWordOccurrence(chunks, notion)
            const preciseTimestamp = wordOccurence || endTimestamp

            if (!definitionMap.has(preciseTimestamp)) {
                definitionMap.set(preciseTimestamp, []);
            }

            definitionMap.get(preciseTimestamp)?.push({
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
    // Get definition groups from the map
    let definitions = Array.from(definitionMap.entries())
        .map(([timestamp, definitions]) => ({
            timestamp,
            definitions
        }));

    // Add recap of all definitions at the end, ensuring no duplicates
    const allDefinitions = Array.from(definitionMap.values()).flat();
    if (allDefinitions.length > 0) {
        // Remove duplicate definitions by using a Map with JSON stringified objects as keys
        const uniqueDefinitionsMap = new Map();
        allDefinitions.forEach(def => {
            // Create a key that represents this definition
            const key = JSON.stringify({
                notion: def.notion.trim().toLowerCase(),
                definition: def.definition.trim().toLowerCase()
            });
            uniqueDefinitionsMap.set(key, def);
        });

        const uniqueDefinitions = Array.from(uniqueDefinitionsMap.values());

        const lastTimestamp = Math.max(...chunks.map(chunk => chunk?.metadata?.end || 0));
        definitions.push({
            timestamp: lastTimestamp,
            definitions: uniqueDefinitions
        });
    }

    // Now merge after adding the recap
    definitions = mergeCloseDefinitions(definitions, 5);

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


export const generateInteraciveVideoData = async (props: { documentId?: string, youtubeUrl?: string }) => {
    const { documentId, youtubeUrl } = props;

    let chunks: (DocumentChunk & { metadata: DocumentChunkMeta | null })[] = []
    let mediaName = ""
    let s3ObjectName = ""

    if (documentId) {
        const video = await prisma.document.findUnique({
            where: {
                id: documentId
            },
            include: {
                documentChunks: {
                    include: {
                        metadata: true,
                    }
                }
            }
        })
        mediaName = video?.mediaName || "";
        chunks = (video?.documentChunks || []).sort((a, b) => (a.metadata?.start || 0) - (b.metadata?.start || 0))
        s3ObjectName = video?.s3ObjectName || "";
    } else if (youtubeUrl) {
        const processingResponse = await axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { url: youtubeUrl }, {
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => response.data);
        mediaName = processingResponse.document.mediaName
        chunks = (processingResponse.chunks || []).sort((a, b) => (a.metadata?.start || 0) - (b.metadata?.start || 0))
    }


    const videoTranscript = chunks.map((chunk, i) => `timestamp [${(chunk.metadata?.start || 0).toFixed()}; ${(chunk.metadata?.end || 0).toFixed()}] => ${chunk.text}\n---------\n`).join('')
    const prompt = `
Voici la transcription d'une vidéo scientifique dont le titre est "${mediaName}".
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
        const { questions, definitions } = parseVideoContent(response, chunks);

        const ivData = {
            questions: questions,
            videoTitle: mediaName,
            videoPublicUrl: youtubeUrl ? youtubeUrl : `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/s3/presigned_url/object_name/${s3ObjectName}`,
            definitions: definitions,
        } as InteractiveVideoData;
        return ivData;
    }

}
