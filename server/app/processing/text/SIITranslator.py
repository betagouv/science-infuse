import os
from typing import List
from transformers import pipeline
import torch

TRANSLATOR_BATCH_SIZE = 1 if os.environ.get('ENVIRONMENT', '').lower().startswith('dev') else 10


class SITranslator:
    def __init__(self):
        self.pipe = pipeline("translation", model="Areeb123/En-Fr_Translation_Model", device=0 if torch.cuda.is_available() else -1, torch_dtype=torch.float16)
    
    def clean_output(self, text:str):
        return text.replace('& #160;', '')

    def en_to_fr_batch(self, texts: List[str], batch_size=TRANSLATOR_BATCH_SIZE):
        translations = self.pipe(texts, batch_size=batch_size, max_length=512, truncation=True)
        return [self.clean_output(translation['translation_text']) for translation in translations]

    def en_to_fr(self, text: str):
        return self.clean_output(self.en_to_fr_batch([text])[0])