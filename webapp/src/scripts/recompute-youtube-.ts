import { getTiptapNodeText } from '../app/api/course/chapters/blocks/[id]/getTiptapNodeText'
import { getEmbeddings, getTextToEmbeed } from '../lib/utils/embeddings'
import { DocumentChunk, DocumentChunkMeta, Document, PrismaClient, Block, Chapter } from '@prisma/client'
import cliProgress from 'cli-progress'
import { JSONContent } from '@tiptap/core'

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
    // console.log("\n", textToEmbeed)
    await updateDocumentChunkEmbedding(chunk.id, embeddings)
}

const updateChapterBlockEmbedding = async (id: string, embedding: number[]) => {
    const result = await prisma.$queryRaw`
      UPDATE "Block"
      SET "textEmbedding" = ${embedding}::vector
      WHERE id = ${id}
    `;
    return result
}

async function processChapterBlock(chunk: Block & { chapter: Chapter }) {
    const blockText = getTiptapNodeText({ content: chunk.content } as JSONContent, 0);
    const textToEmbeed = `${chunk.chapter.title}\n${chunk.title}\n${blockText}`
    const embeddings = await getEmbeddings(textToEmbeed);
    await updateChapterBlockEmbedding(chunk.id, embeddings)
}


async function main() {
    const chunks = await prisma.documentChunk.findMany({
        include: {
            metadata: true,
            document: true,
        },
    })

    const progressDocumentChunks = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    progressDocumentChunks.start(chunks.length, 0)

    for (const chunk of chunks) {
        await processDocumentChunk(chunk as DocumentChunk & { document: Document, metadata: DocumentChunkMeta })
        progressDocumentChunks.increment()
    }

    progressDocumentChunks.stop()


    const chapterBlocks = await prisma.block.findMany({ include: { chapter: true } })

    const progressChapterBlocks = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    progressChapterBlocks.start(chapterBlocks.length, 0)

    for (const block of chapterBlocks) {
        await processChapterBlock(block)
        progressChapterBlocks.increment()
    }

    progressChapterBlocks.stop()
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })