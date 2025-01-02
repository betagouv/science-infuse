from S3Storage import S3Storage
from processing.BaseDocumentProcessor import BaseDocumentProcessor
from processing.audio.SIWhisperModel import SIWhisperModel
# from pytube import YouTube
from pytubefix import YouTube
import os

from schemas import Document, DocumentWithChunks, VideoTranscriptChunk, VideoTranscriptMetadata

class YoutubeProcessor(BaseDocumentProcessor):
    def __init__(self, whisper: SIWhisperModel, s3: S3Storage, youtube_url: str, paragraph_pause_threshold: float = 1, use_oauth: bool = False):
        self.whisper = whisper
        self.youtube_url = youtube_url
        self.paragraph_pause_threshold = paragraph_pause_threshold
        self.s3 = s3
        self.use_oauth = use_oauth
        super().__init__()

    def download_youtube_video(self):
        output_path = os.path.join(self.base_download_folder, 'youtube')
        os.makedirs(output_path, exist_ok=True)
        filename = f"{self.id}.mp4"
        file_path = os.path.join(output_path, filename)
        if (self.use_oauth is True):
            yt = YouTube(self.youtube_url, use_oauth=True, allow_oauth_cache=True)
        else:
            yt = YouTube(self.youtube_url)
        print("YT", yt)
        video_name = yt.vid_info.get("videoDetails", {}).get("title", "Untitled Video")
        yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first().download(output_path=output_path, filename=filename)
        return file_path, video_name

    def extract_document(self):
        # Load and process audio file
        video_path, video_name = self.download_youtube_video()
        video_s3ObjectName = f"youtube/{self.get_random_uuid()}.mp4"
        # print("EXTRACT DOCUMNET YOUTUBE video_s3ObjectName 1", video_s3ObjectName)
        # save video to s3
        self.whisper.set_paragraph_pause_threshold(self.paragraph_pause_threshold)
        segments = self.whisper.get_paragraphs_from_audio_path(video_path)

        self.save_to_s3(self.s3, video_path, video_s3ObjectName)
        # print("EXTRACT DOCUMNET YOUTUBE video_s3ObjectName 2", video_s3ObjectName)

        document = Document(
            id=self.id, 
            publicPath=self.youtube_url, 
            originalPath=self.youtube_url,
            s3ObjectName=video_s3ObjectName,
            mediaName=video_name,
        )
        chunks = [
            VideoTranscriptChunk(
                text=segment.text,
                title=video_name,
                document=document,
                metadata=VideoTranscriptMetadata(
                    start=segment.start,
                    end=segment.end
                )
            ) 
        for segment in segments]

        return document, chunks