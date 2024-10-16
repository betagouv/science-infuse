import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import axios from "axios";

export const getEmbeddings = async (text: string): Promise<number[]> => {

    const embeddingResponse = await axios.post(`${NEXT_PUBLIC_SERVER_URL}/embedding/`, {
        text
    })
    const embedding: number[] = embeddingResponse.data
    return embedding;
}
