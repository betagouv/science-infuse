import { getEmbeddings, getTextToEmbeed } from '../lib/utils/embeddings'
import { DocumentChunk, DocumentChunkMeta, Document, PrismaClient } from '@prisma/client'
import cliProgress from 'cli-progress'

const prisma = new PrismaClient()

const updateDocumentChunkEmbedding = async (id: string, embedding: number[]) => {
    const result = await prisma.$queryRaw`
      UPDATE "DocumentChunk"
      SET "textEmbedding" = ${embedding}::vector
      WHERE id = ${id}::uuid
    `;
    return result;
};

async function processChunk(chunk: DocumentChunk & { document: Document, metadata: DocumentChunkMeta }) {
    const textToEmbeed = getTextToEmbeed(chunk)

    const embeddings = await getEmbeddings(textToEmbeed);
    // console.log("\n", textToEmbeed)
    await updateDocumentChunkEmbedding(chunk.id, embeddings)
}


async function main() {
    const chunks = await prisma.documentChunk.findMany({
        // take: 1,
        // where: {
        //     id: "c237abe4-2737-47ec-9267-50abf5f9737c"
        //     // mediaType: "website_experience"
        // },
        include: {
            metadata: true,
            document: true,
        },
    })

    const progressBar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic)
    progressBar.start(chunks.length, 0)

    // console.log(chunks)
    for (const chunk of chunks) {
        await processChunk(chunk as DocumentChunk & { document: Document, metadata: DocumentChunkMeta })
        progressBar.increment()
    }

    progressBar.stop()
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })