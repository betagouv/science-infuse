from typing import List
from faster_whisper import WhisperModel
import matplotlib.pyplot as plt
import time
import datetime
from pydub import AudioSegment
from tqdm import tqdm
import numpy as np
import pydantic
from transformers import AutoProcessor, AutoModelForCausalLM 
import torch
from PIL.Image import Image


class SIImageDescription:
    def __init__(self):
        self.model = AutoModelForCausalLM.from_pretrained("microsoft/Florence-2-large-ft", trust_remote_code=True, torch_dtype=torch.float16).to(torch.cuda.current_device())
        self.processor = AutoProcessor.from_pretrained("microsoft/Florence-2-large-ft", trust_remote_code=True)
    
    def get_description(self, base_64_image:Image):
        try:
            task = "<MORE_DETAILED_CAPTION>"
            inputs = self.processor(text=task, images=base_64_image, return_tensors="pt").to(torch.cuda.current_device(), dtype=torch.float16)
            generated_ids = self.model.generate(
                input_ids=inputs["input_ids"],
                pixel_values=inputs["pixel_values"],
                max_new_tokens=512,
                num_beams=3
            )
            generated_text = self.processor.batch_decode(generated_ids, skip_special_tokens=False)[0]

            parsed_answer = self.processor.post_process_generation(generated_text, task=task, image_size=(base_64_image.width, base_64_image.height))
            return parsed_answer.get(task, False)
        except Exception as e:
            print("SIImageDescription.get_description error:", e)
            return False
