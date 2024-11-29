from typing import List
from transformers import AutoModelForSequenceClassification
from schemas import RerankTextQuery
# from schemas import ChunkWithScore, RerankTextQuery
import numpy as np
from pydantic import BaseModel

class TextWithScore(BaseModel):
    text: str
    score: float
    
class SIReranker:
    def __init__(self):
        self.model = AutoModelForSequenceClassification.from_pretrained(
            'jinaai/jina-reranker-v2-base-multilingual',
            torch_dtype="auto",
            trust_remote_code=True,
        )

        self.model.to('cuda') # or 'cpu' if no GPU is available
        self.model.eval()

    def sort_raw_texts(self, query: RerankTextQuery) -> List[TextWithScore]:
        pairs = [[query.query, text] for text in query.texts]
        if len(pairs) == 0:
            return []

        scores = self.model.predict(pairs)
        
        sorted_texts_with_scores = sorted(
            [TextWithScore(text=text, score=score) for text, score in zip(query.texts, scores)],
            key=lambda x: x.score,
            reverse=True
        )
        
        return sorted_texts_with_scores

    # def sort_document_chunks(self, document_chunks: List[ChunkWithScore], query: str, alpha: float = 0.5) -> List[ChunkWithScore]:
    #     """
    #     Sort document chunks based on reranker scores and adjust Weaviate scores according to reranker's score.<br/>
    #     **alpha** Control parameter for score adjustment (0 <= alpha <= 1)<br/>
    #         **0**: No adjustment (pure weaviate scores)<br/>
    #         **1**: Maximum adjustment based on reranker scores
    #     """
    #     sentence_pairs = [[query, chunk.title + ". " + chunk.text] for chunk in document_chunks]
    #     if (len(sentence_pairs) <= 0):
    #         return []
    #     reranker_scores = self.model.compute_score(sentence_pairs, max_length=1024)

    #     scored_chunks = list(zip(reranker_scores, [chunk.score for chunk in document_chunks], document_chunks))

    #     sorted_chunks = sorted(scored_chunks, key=lambda x: x[0], reverse=True)

    #     sorted_reranker_scores, sorted_weaviate_scores, _ = zip(*sorted_chunks)

    #     reranker_array = np.array(sorted_reranker_scores)
    #     weaviate_array = np.array(sorted_weaviate_scores)

    #     min_reranker = np.min(reranker_array)
    #     max_reranker = np.max(reranker_array)
    #     range_reranker = max_reranker - min_reranker

    #     weaviate_normalized = (weaviate_array - np.min(weaviate_array)) / (np.max(weaviate_array) - np.min(weaviate_array))

    #     # Calculate new scores: maintain reranker order but increase proportionally to Weaviate scores
    #     new_scores = reranker_array + (alpha * weaviate_normalized * range_reranker)

    #     # Update chunks with new scores, maintaining reranker order
    #     for (original_reranker_score, _, chunk), new_score in zip(sorted_chunks, new_scores):
    #         chunk.score = max(0, min(new_score, 1))
    #     return [chunk for _, _, chunk in sorted_chunks]
     

    # def sort_docment_chunks(self, document_chunks: List[ChunkWithScore], query: str) -> List[ChunkWithScore]:
    #     sentence_pairs = [[query, chunk.title+". "+chunk.text] for chunk in document_chunks]
        
    #     scores = self.model.compute_score(sentence_pairs, max_length=1024)

    #     scored_chunks = list(zip(scores, document_chunks))
    #     sorted_chunks = sorted(scored_chunks, key=lambda x: x[0], reverse=True)
    #     for score, chunk in sorted_chunks:
    #         chunk.score = score

    #     return [chunk for score, chunk in sorted_chunks]
