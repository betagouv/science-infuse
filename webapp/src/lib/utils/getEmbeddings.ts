import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import axios from "axios";

export const getEmbeddings = async (text: string) => {

    const embeddingResponse = await axios.post(`${NEXT_PUBLIC_SERVER_URL}/embedding/`, {
        text
    })
    const embedding = embeddingResponse.data
    return embedding;
}
