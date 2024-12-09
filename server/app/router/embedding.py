from fastapi import APIRouter
from typing import List

from schemas import EmbeddingQuery
from transformers import AutoTokenizer, AutoModel
import torch
from sentence_transformers import SentenceTransformer

# tokenizer = AutoTokenizer.from_pretrained("OrdalieTech/Solon-embeddings-base-0.1", revision="d9cfe58bd70941b8642f2b97c5949041dc829d08")
# model = AutoModel.from_pretrained("OrdalieTech/Solon-embeddings-base-0.1", revision="d9cfe58bd70941b8642f2b97c5949041dc829d08") 
model = SentenceTransformer("OrdalieTech/Solon-embeddings-base-0.1")
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)
router = APIRouter()

def get_embeddings(text: str):
    embeddings = model.encode(text)
    return embeddings.tolist()
    # inputs = tokenizer(
    #     text,
    #     padding=True,
    #     truncation=True,
    #     return_tensors="pt",
    # ).to(device)

    # result = model(**inputs)
    # embeddings = result.last_hidden_state[:, 0, :].cpu().detach().numpy()
    # array = embeddings.flatten().tolist()
    # return array


@router.post("/", response_model=List[float])
async def _embedding(query: EmbeddingQuery):
    return get_embeddings(query.text)
