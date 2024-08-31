from fastapi import APIRouter
from typing import List

from search.search_chunks import reranker
from processing.text.SIReranker import TextWithScore
from schemas import EmbeddingQuery, RerankTextQuery
from transformers import AutoTokenizer, AutoModel
import torch

tokenizer = AutoTokenizer.from_pretrained("OrdalieTech/Solon-embeddings-base-0.1")
model = AutoModel.from_pretrained("OrdalieTech/Solon-embeddings-base-0.1") 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
router = APIRouter()

@router.post("/", response_model=List[float])
async def _embedding(query: EmbeddingQuery):
    print("EMBEDDINGS", query.text)
    inputs = tokenizer(
        query.text,
        padding=True,
        truncation=False,
        return_tensors="pt",
    ).to(device)

    result = model(**inputs)
    embeddings = result.last_hidden_state[:, 0, :].cpu().detach().numpy()
    array = embeddings.flatten().tolist()
    return array
