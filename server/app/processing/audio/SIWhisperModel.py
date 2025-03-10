import subprocess
from typing import List
from faster_whisper import WhisperModel
import matplotlib.pyplot as plt
import time
import datetime
from pydub import AudioSegment
from tqdm import tqdm
import numpy as np
from pydantic import BaseModel
import spacy


class TranscriptSegment(BaseModel):
    text: str
    start: float
    end: float
    duration: float

class ParagraphSegment(BaseModel):
    text: str
    start: float
    end: float
    duration: float
    word_segments: List[TranscriptSegment]

class SIWhisperModel:
    def __init__(self, model_path, model_name, paragraph_pause_threshold=2.0):
        self.paragraph_pause_threshold = paragraph_pause_threshold
        self.model_path = model_path
        self.model_name = model_name
        self.model = WhisperModel(self.model_path, device="cuda", compute_type="float16")
        self.nlp = spacy.load('fr_core_news_sm')
    
    def set_paragraph_pause_threshold(self, threshold: float):
        self.paragraph_pause_threshold = threshold

    def get_sentences_from_audio_path(self, audio_path: str) -> List[TranscriptSegment]:
        word_segments = self.get_srt(audio_path)
        sentences_segments = self.group_into_sentences(word_segments)
        return sentences_segments
    
    def get_paragraphs_from_audio_path(self, audio_path: str) -> List[ParagraphSegment]:
        word_segments = self.get_srt(audio_path)
        sentences_segments = self.group_into_sentences(word_segments)
        paragraphs_segments = self.group_into_paragraphs(sentences_segments, word_segments)
        return paragraphs_segments

    @staticmethod
    def get_audio_length(audio_path: str):
        command = ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", audio_path]
        result = subprocess.run(command, capture_output=True, text=True, check=True)
        duration = float(result.stdout)
        return duration

    # @staticmethod
    # def get_audio_length(audio_path: str):
    #     audio = AudioSegment.from_file(audio_path)
    #     duration = len(audio) / 1000.0
    #     return duration

    def get_srt(self, audio_path, debug=False):
        start_time = time.time()
        
        segments: list[TranscriptSegment] = []
        total_duration = self.get_audio_length(audio_path)
        with tqdm(total=total_duration, desc=self.model_name, unit="s") as pbar:
            transcribed_segments, info = self.model.transcribe(audio_path, beam_size=5, language="fr", word_timestamps=True, condition_on_previous_text=False)
            for segment in transcribed_segments:
                start_time_segment = segment.start
                end_time_segment = segment.end
                pbar.n = min(segment.end, total_duration)
                pbar.refresh()
                if debug:
                    print(f"Segment: {str(datetime.timedelta(seconds=int(start_time_segment)))} - {str(datetime.timedelta(seconds=int(end_time_segment)))} : {segment.text}")
                for word in segment.words:
                    segments.append(TranscriptSegment(text=word.word, start=word.start, end=word.end, duration=word.end - word.start))
            pbar.n = total_duration
            pbar.refresh()

        end_time = time.time()
        time_taken = end_time - start_time
        print("time_taken", time_taken)
        return segments

    def group_into_sentences(self, segments) -> List[TranscriptSegment]:
        # Load the spaCy model (ensure you have this model downloaded, or replace with one you have)    
        # Combine all text into one string and retain original indices
        full_text = ''
        current_length = 0
        index_mapping = []
        for segment in segments:
            full_text += segment.text
            index_mapping.append((current_length, current_length + len(segment.text)))
            current_length += len(segment.text)

        # Process the full text with spaCy
        doc = self.nlp(full_text.strip())
        
        # Create new segments for sentences
        new_segments = []
        for sent in doc.sents:
            start_index = sent.start_char
            end_index = sent.end_char
            
            # Calculate the start time and duration of the sentence
            start_time = next((seg.start for i, seg in enumerate(segments) if index_mapping[i][0] <= start_index < index_mapping[i][1]), None)
            end_time = next((segments[i-1].start + segments[i-1].duration for i, seg in enumerate(segments, 1) if index_mapping[i-1][0] < end_index <= index_mapping[i-1][1]), segments[-1].start + segments[-1].duration)
            
            if start_time is not None:
                new_segments.append(TranscriptSegment(text=sent.text.strip(), start=start_time, end=end_time, duration=end_time - start_time))
        
        return new_segments

    def group_into_paragraphs(self, sentence_segments: List[TranscriptSegment], word_segments: List[TranscriptSegment]) -> List[ParagraphSegment]:
        paragraphs = []
        current_paragraph = []

        for i in range(len(sentence_segments)):
            if current_paragraph:
                # Calculate the gap between the current segment and the previous one
                gap = sentence_segments[i].start - current_paragraph[-1].end
                if gap > self.paragraph_pause_threshold:
                    # If the gap is large, finalize the current paragraph
                    if current_paragraph:
                        start_time = current_paragraph[0].start
                        end_time = current_paragraph[-1].end
                        total_duration = end_time - start_time
                        combined_text = " ".join([seg.text for seg in current_paragraph])
                        
                        # Get word segments that fall within this paragraph's time range
                        paragraph_words = [
                            word for word in word_segments 
                            if start_time <= word.start < end_time
                        ]
                        
                        paragraphs.append(ParagraphSegment(
                            text=combined_text,
                            start=start_time,
                            end=end_time,
                            duration=total_duration,
                            word_segments=[TranscriptSegment(start=word.start, end=word.end, text=word.text, duration=word.end-word.start) for word in paragraph_words]
                        ))
                        current_paragraph = []
            current_paragraph.append(sentence_segments[i])

        # Finalize the last paragraph
        if current_paragraph:
            start_time = current_paragraph[0].start
            end_time = current_paragraph[-1].end
            total_duration = end_time - start_time
            combined_text = " ".join([seg.text for seg in current_paragraph])
            
            # Get word segments for the last paragraph
            paragraph_words = [
                word for word in word_segments 
                if start_time <= word.start < end_time
            ]
            
            paragraphs.append(ParagraphSegment(
                text=combined_text,
                start=start_time,
                end=end_time,
                duration=total_duration,
                word_segments=paragraph_words
            ))

        return paragraphs