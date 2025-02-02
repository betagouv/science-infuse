import os
os.environ["TOKENIZERS_PARALLELISM"] = "false"

import asyncio
from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter
from typing import List
from schemas import EmbeddingQuery
from sentence_transformers import SentenceTransformer
import torch

# Load model at startup
model = SentenceTransformer("OrdalieTech/Solon-embeddings-base-0.1")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

router = APIRouter()
executor = ThreadPoolExecutor()

def blocking_encode(text: str) -> List[float]:
    # This call is blocking; offload it to a thread.
    return model.encode(text).tolist()

async def get_embeddings(text: str) -> List[float]:
    loop = asyncio.get_running_loop()
    embeddings = await loop.run_in_executor(executor, blocking_encode, text)
    return embeddings

@router.post("/", response_model=List[float])
async def embedding_endpoint(query: EmbeddingQuery):
    return await get_embeddings(query.text)
