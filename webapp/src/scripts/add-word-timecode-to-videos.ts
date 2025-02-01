import { getTiptapNodeText } from '../app/api/course/chapters/blocks/[id]/getTiptapNodeText'
import { getEmbeddings, getTextToEmbeed } from '../lib/utils/embeddings'
import { DocumentChunk, DocumentChunkMeta, Document, PrismaClient, Block, Chapter } from '@prisma/client'
import cliProgress from 'cli-progress'
import { JSONContent } from '@tiptap/core'
import axios from 'axios'
import { ServerProcessingResult } from '@/queueing/pgboss/jobs/index-contents'
import { NEXT_PUBLIC_SERVER_URL } from '../config'
import { insertChunk } from '../lib/utils/db'

const prisma = new PrismaClient()

const updateDocumentChunkEmbedding = async (id: string, embedding: number[]) => {
    const result = await prisma.$queryRaw`
      UPDATE "DocumentChunk"
      SET "textEmbedding" = ${embedding}::vector
      WHERE id = ${id}::uuid
    `;
    return result;
};

async function processDocumentChunk(chunk: DocumentChunk & { document: Document, metadata: DocumentChunkMeta }) {
    const textToEmbeed = getTextToEmbeed(chunk)
    const embeddings = await getEmbeddings(textToEmbeed);
    await updateDocumentChunkEmbedding(chunk.id, embeddings)
}

const reComputeEmbeddings = async (documentId: string) => {
    const chunks = await prisma.documentChunk.findMany({
        where: {
            documentId
        },
        include: {
            metadata: true,
            document: true,
        },
    })

    for (const chunk of chunks) {
        await processDocumentChunk(chunk as DocumentChunk & { document: Document, metadata: DocumentChunkMeta })
    }
}

const processDocument = async (documentId: string) => {
    const document = await prisma.document.findUnique({
        where: { id: documentId },
        include: {
            documentChunks: {
                include: {
                    metadata: true
                }
            }
        }
    })

    if (!document) {
        console.log(`${documentId} not found`)
        return false;
    }

    const videoTranscriptChunks = document
        .documentChunks
        .filter(c => c.mediaType == "video_transcript")

    const oldDocumentChunksIds = videoTranscriptChunks
        .map(c => c.id);

    const s3ObjectName = document.s3ObjectName

    const processingResponse = await axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { name: document.mediaName, s3_object_name: s3ObjectName }, {
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => response.data);

    await Promise.all(processingResponse
        .chunks
        .filter(c => c.mediaType == "video_transcript")
        .map(async ({ document: _document, metadata, ...chunk }) => {
            return insertChunk(document, chunk, metadata)
        }));

    await prisma.documentChunk.deleteMany({
        where: {
            id: {
                in: oldDocumentChunksIds
            }
        }
    })

    await reComputeEmbeddings(document.id)
}

async function main() {
    // Find all documents with video_transcript chunks and include their metadata
    const documents = await prisma.document.findMany({
        where: {
            documentChunks: {
                some: {
                    mediaType: "video_transcript"
                }
            },
        },
        include: {
            documentChunks: {
                where: {
                    mediaType: "video_transcript"
                },
                include: {
                    metadata: true
                }
            }
        }
    });

    // Filter out documents where all video_transcript chunks already have word_segments
    const documentsNeedingProcessing = documents.filter(doc => {
        const allChunksHaveWordSegments = doc.documentChunks.every(chunk => {
            const wordSegments = Array.isArray(chunk.metadata?.word_segments) 
                ? chunk.metadata.word_segments 
                : typeof chunk.metadata?.word_segments === 'string'
                    ? JSON.parse(chunk.metadata.word_segments)
                    : [];
            return wordSegments.length > 0;
        });
        return !allChunksHaveWordSegments;
    })
    // First, process videos of 20min or less
    // TODO: comment out. 
    .filter(doc => {
        const videoDurationSeconds = Math.max(...doc.documentChunks.map(chunk => (chunk.metadata?.end || Infinity))) 
        return videoDurationSeconds <= 60 * 15
    })



    console.log(`Found ${documentsNeedingProcessing.length} documents out of ${documents.length} that need processing`);
    return;

    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    progressBar.start(documentsNeedingProcessing.length, 0);

    for (const document of documentsNeedingProcessing) {
        await processDocument(document.id);
        progressBar.increment();
    }

    progressBar.stop();
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })