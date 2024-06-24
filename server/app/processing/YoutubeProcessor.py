from app.processing.BaseDocumentProcessor import BaseDocumentProcessor
from app.processing.stt.SIWhisperModel import SIWhisperModel
from pytube import YouTube
import os

from app.schemas import DocumentChunk, MediaType

class YoutubeProcessor(BaseDocumentProcessor):
    def __init__(self, client, whisper: SIWhisperModel, youtube_url: str):
        self.whisper = whisper
        self.youtube_url = youtube_url
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

    def extract_chunks(self):
        # Load and process audio file
        video_path, video_name = self.download_youtube_video()
        segments = self.whisper.get_paragraphs_from_audio_path(video_path)
        chunks = [DocumentChunk(
            media_name=video_name,
            chunk=segment.text,
            document_id=self.id, 
            local_path=video_path, 
            original_public_path=self.youtube_url,
            media_type=MediaType.YOUTUBE,
            start_offset=int(segment.start), 
            end_offset=int(segment.end)
        ) for segment in segments]

        return chunks