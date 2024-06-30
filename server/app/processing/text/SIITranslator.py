from typing import List
from transformers import pipeline
import torch



class SITranslator:
    def __init__(self):
        self.pipe = pipeline("translation", model="Areeb123/En-Fr_Translation_Model", device=0 if torch.cuda.is_available() else -1, torch_dtype=torch.float16)
    
    def clean_output(self, text:str):
        return text.replace('& #160;', '')

    def en_to_fr_batch(self, texts: List[str], batch_size=10):
        translations = self.pipe(texts, batch_size=batch_size)
        return [self.clean_output(translation['translation_text']) for translation in translations]

    def en_to_fr(self, text: str):
        return self.clean_output(self.en_to_fr([text])[0])