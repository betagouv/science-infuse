import { getEmbeddings, getTextToEmbeed } from '../lib/utils/embeddings'
import { DocumentChunk, DocumentChunkMeta, Document, PrismaClient, Prisma } from '@prisma/client'
import cliProgress from 'cli-progress'
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

    const processingResponse = await axios.post<ServerProcessingResult>(
        `${NEXT_PUBLIC_SERVER_URL}/process/youtube`,
        {
            name: document.mediaName,
            s3_object_name: s3ObjectName
        },
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    ).then(response => response.data);

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

const processBatch = async (documentIds: string[], progressBar: cliProgress.SingleBar) => {
    await Promise.all(documentIds.map(async (id) => {
        await processDocument(id);
        progressBar.increment();
    }));
}

async function getDocumentsNeedingProcessing(skip: number, batchSize: number) {

    const batch = await prisma.document.findMany({
        where: {
            AND: [
                {
                    documentChunks: {
                        some: {
                            mediaType: "video_transcript",
                            OR: [
                                { metadata: { word_segments: { equals: Prisma.DbNull } } },
                                { metadata: { word_segments: { equals: [] } } }
                            ]
                        }
                    }
                },
                {
                    documentChunks: {
                        every: {
                            mediaType: "video_transcript",
                            metadata: {
                                end: { lte: 900 }
                            }
                        }
                    }
                }
            ]
        },
        include: {
            documentChunks: {
                where: { mediaType: "video_transcript" },
                include: { metadata: true }
            }
        },
        take: batchSize,
        skip: skip
    });
    return batch;

    // const batch = await prisma.document.findMany({
    //     where: {
    //         documentChunks: {
    //             some: {
    //                 mediaType: "video_transcript"
    //             }
    //         },
    //     },
    //     include: {
    //         documentChunks: {
    //             where: {
    //                 mediaType: "video_transcript"
    //             },
    //             include: {
    //                 metadata: true
    //             }
    //         }
    //     },
    //     take: batchSize,
    //     skip: skip
    // });

    // return batch.filter(doc => {
    //     const allChunksHaveWordSegments = doc.documentChunks.every(chunk => {
    //         try {
    //             const wordSegments = Array.isArray(chunk.metadata?.word_segments)
    //                 ? chunk.metadata.word_segments
    //                 : typeof chunk.metadata?.word_segments === 'string'
    //                     ? JSON.parse(chunk.metadata.word_segments)
    //                     : [];
    //             return wordSegments.length > 0;
    //         } catch (error) {
    //             console.error(`Error parsing word_segments for chunk ${chunk.id}:`, error);
    //             return false;
    //         }
    //     });
    //     return !allChunksHaveWordSegments;
    // })
    // // .filter(doc => {
    // //     const videoDurationSeconds = Math.max(...doc.documentChunks.map(chunk => (chunk.metadata?.end || Infinity)))
    // //     return videoDurationSeconds <= 60 * 15
    // // });
}

async function getTotalDocumentCount() {
    return await prisma.document.count({
        where: {
            documentChunks: {
                some: {
                    mediaType: "video_transcript"
                }
            }
        }
    });
}

async function main() {
    const QUERY_BATCH_SIZE = 500; // Number of documents to query at once
    const PROCESSING_BATCH_SIZE = 4; // Number of documents to process in parallel

    const totalDocuments = await getTotalDocumentCount();
    console.log(`Total documents to check: ${totalDocuments}`);

    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    let totalProcessed = 0;
    let documentsNeedingProcessing: string[] = [];

    // First pass: Identify all documents needing processing
    let skip = 0;
    progressBar.start(totalDocuments, 0);

    while (true) {
        const batch = await getDocumentsNeedingProcessing(skip, QUERY_BATCH_SIZE);
        if (batch.length === 0) break;

        documentsNeedingProcessing.push(...batch.map(doc => doc.id));
        skip += QUERY_BATCH_SIZE;
        progressBar.increment(QUERY_BATCH_SIZE);
    }

    progressBar.stop();
    console.log(`Found ${documentsNeedingProcessing.length} documents that need processing`);

    // Second pass: Process the identified documents
    if (documentsNeedingProcessing.length > 0) {
        const processingBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
        processingBar.start(documentsNeedingProcessing.length, 0);

        // Process documents in smaller batches
        for (let i = 0; i < documentsNeedingProcessing.length; i += PROCESSING_BATCH_SIZE) {
            const batch = documentsNeedingProcessing.slice(i, i + PROCESSING_BATCH_SIZE);
            await processBatch(batch, processingBar);
        }

        processingBar.stop();
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })