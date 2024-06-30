from app.processing.BaseDocumentProcessor import BaseDocumentProcessor
from app.processing.audio.SIWhisperModel import SIWhisperModel
from pytube import YouTube
import os

from app.schemas import Document, VideoTranscriptChunk, VideoTranscriptMetadata

class YoutubeProcessor(BaseDocumentProcessor):
    def __init__(self, client, whisper: SIWhisperModel, youtube_url: str, paragraph_pause_threshold: float = 1):
        self.whisper = whisper
        self.youtube_url = youtube_url
        self.paragraph_pause_threshold = paragraph_pause_threshold
        super().__init__(client)
        
    def download_youtube_video(self):
        output_path = os.path.join(self.base_download_folder, 'youtube')
        os.makedirs(output_path, exist_ok=True)
        filename = f"{self.id}.mp4"
        file_path = os.path.join(output_path, filename)
        yt = YouTube(self.youtube_url)
        video_name = yt.vid_info.get("videoDetails", {}).get("title", "Untitled Video")
        yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first().download(output_path=output_path, filename=filename)
        return file_path, video_name

    def extract_document(self):
        # Load and process audio file
        video_path, video_name = self.download_youtube_video()
        self.whisper.set_paragraph_pause_threshold(self.paragraph_pause_threshold)
        segments = self.whisper.get_paragraphs_from_audio_path(video_path)
        chunks = [
            VideoTranscriptChunk(
                text=segment.text,
                metadata=VideoTranscriptMetadata(
                    start_offset=segment.start,
                    end_offset=segment.end
                )
            ) 
        for segment in segments]
        document = Document(
            chunks=chunks,
            document_id=self.id, 
            local_path=video_path, 
            original_public_path=self.youtube_url,
            media_name=video_name,
        )

        return document, chunks