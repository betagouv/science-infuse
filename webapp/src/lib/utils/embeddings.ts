import { DocumentChunk, Document, DocumentChunkMeta } from "@prisma/client";
import { NEXT_PUBLIC_SERVER_URL } from "../../config";
import axios from "axios";

export const getEmbeddings = async (text: string): Promise<number[]> => {

    const embeddingResponse = await axios.post(`${NEXT_PUBLIC_SERVER_URL}/embedding/`, {
        text
    })
    const embedding: number[] = embeddingResponse.data
    return embedding;
}

// increase accuracy of chunk retrieval by providing more context to the embedded vector.
export const getTextToEmbeed = (chunk: DocumentChunk & { document: Document, metadata?: DocumentChunkMeta }) => {
    let text = ""
    switch (chunk.mediaType) {
        case "pdf_text":
            text = `${chunk.document.mediaName}\n${chunk.title}\n${chunk.text}`
            break
        case "pdf_image":
        case "raw_image":
        case "image":
            text = `Image.\n${chunk.document.mediaName}\n${chunk.title}\n${chunk.text}`
            break
        case "pdf_text":
            text = `${chunk.document.mediaName}\n${chunk.title}\n${chunk.text}`
            break
        case "video_transcript":
            text = `Video. ${chunk.document.mediaName}\n${chunk.text}`
            break
        case "website_qa":
            text = `Question santé. ${chunk.document.mediaName}\n${chunk.text}`
            break
        case "website_experience":
            text = `Interactif. Jeux. ${chunk.document.mediaName}\n${chunk.text}`
            break
        default:
            text = chunk.text
            break
    }
    return text;
}
