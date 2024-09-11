from fastapi import APIRouter
from typing import List

from schemas import EmbeddingQuery
from transformers import AutoTokenizer, AutoModel
import torch

tokenizer = AutoTokenizer.from_pretrained("OrdalieTech/Solon-embeddings-base-0.1")
model = AutoModel.from_pretrained("OrdalieTech/Solon-embeddings-base-0.1") 
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
router = APIRouter()

def get_embeddings(text: str):
    inputs = tokenizer(
        text,
        padding=True,
        truncation=False,
        return_tensors="pt",
    ).to(device)

    result = model(**inputs)
    embeddings = result.last_hidden_state[:, 0, :].cpu().detach().numpy()
    array = embeddings.flatten().tolist()
    return array


@router.post("/", response_model=List[float])
async def _embedding(query: EmbeddingQuery):
    return get_embeddings(query.text)
