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

    // store the ids of the current video_transcript chunks from this document
    // every chunks should be of type video_transcript, but in the futur it might change.
    // it will be used to remove them after 
    const videoTranscriptChunks = document
        .documentChunks
        .filter(c => c.mediaType == "video_transcript")



    // skip if it already has word timestamps
    const chunksWithWordSegments = videoTranscriptChunks.filter(vtc => {
        const val = Array.isArray(vtc.metadata?.word_segments) ? vtc.metadata.word_segments : []
        return val.length > 0
    })
    const everyChunksHaveWordSegments = chunksWithWordSegments.length == videoTranscriptChunks.length
    if (everyChunksHaveWordSegments) {
        console.log(`${documentId} all chunks already have word_segments. Skipping`)
        return false;
    }


    const oldDocumentChunksIds = videoTranscriptChunks
        .map(c => c.id);


    const s3ObjectName = document.s3ObjectName

    const processingResponse = await axios.post<ServerProcessingResult>(`${NEXT_PUBLIC_SERVER_URL}/process/youtube`, { name: document.mediaName, s3_object_name: s3ObjectName }, {
        headers: {
            'Content-Type': 'application/json',
        },
    }).then(response => response.data);

    // const originalChunkIds = document.chu

    await Promise.all(processingResponse
        .chunks
        .filter(c => c.mediaType == "video_transcript")
        .map(async ({ document: _document, metadata, ...chunk }) => {
            return insertChunk(document, chunk, metadata)
        }));
    // if everything goes well delete the old documentChunks
    await prisma.documentChunk.deleteMany({
        where: {
            id: {
                in: oldDocumentChunksIds
            }
        }
    })
    // finally compute and set embeddings for the new chunks
    await reComputeEmbeddings(document.id)
}

async function main() {

    // find all document containing video_transcript chunks
    const documentChunks = await prisma.documentChunk.findMany({
        where: { mediaType: "video_transcript" },
        select: {
            documentId: true
        },
        distinct: ['documentId']
    })
    const uniqueDocumentIds = documentChunks.map(dc => dc.documentId)


    const progressDocumentChunks = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    // progressDocumentChunks.start(uniqueDocumentIds.length, 0)
    // for each document, update it's document chunks to add word_segments (timestamps for each word from whisper)
    for (const documentId of uniqueDocumentIds) {
        await processDocument(documentId);
        progressDocumentChunks.increment()
    }

    progressDocumentChunks.stop()
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })