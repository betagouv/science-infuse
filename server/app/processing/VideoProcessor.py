import subprocess
from typing import Optional
from S3Storage import S3Storage
from processing.BaseDocumentProcessor import BaseDocumentProcessor
from processing.audio.SIWhisperModel import SIWhisperModel
# from pytube import YouTube
from pytubefix import YouTube
import os

from schemas import Document, DocumentWithChunks, VideoTranscriptChunk, VideoTranscriptMetadata

class VideoProcessor(BaseDocumentProcessor):
    def __init__(self, whisper: SIWhisperModel, s3: S3Storage, youtube_url: Optional[str]=None, s3_video_url: Optional[str]=None, paragraph_pause_threshold: float = 1, use_oauth: bool = False):
        self.whisper = whisper
        self.youtube_url = youtube_url
        self.s3_video_url = s3_video_url
        self.paragraph_pause_threshold = paragraph_pause_threshold
        self.s3 = s3
        self.use_oauth = use_oauth
        self.proxies = None
        if os.environ.get("YOUTUBE_PROXY"):
            self.proxies = {
                "http": os.environ.get("YOUTUBE_PROXY"),
                "https": os.environ.get("YOUTUBE_PROXY")
            }

        super().__init__()

    def download_youtube_video(self, youtube_url):
        output_path = os.path.join(self.base_download_folder, 'youtube')
        os.makedirs(output_path, exist_ok=True)
        filename = f"{self.id}.mp4"
        file_path = os.path.join(output_path, filename)
        if (self.use_oauth is True):
            yt = YouTube(youtube_url, proxies=self.proxies, use_oauth=True, allow_oauth_cache=True)
        else:
            yt = YouTube(youtube_url, proxies=self.proxies)
        print("YT", yt)
        video_name = yt.vid_info.get("videoDetails", {}).get("title", "Untitled Video")
        yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first().download(output_path=output_path, filename=filename)
        return file_path, video_name
    
    def download_s3_video(self, s3_video_url):
        output_path = os.path.join(self.base_download_folder, 'temp_videos')
        os.makedirs(output_path, exist_ok=True)
        filename = f"{self.id}.mp4"
        file_path = os.path.join(output_path, filename)
        self.s3.download_file(object_name=s3_video_url, local_file_path=file_path)

    def get_video_duration(self, video_path):
        try:
            result = subprocess.run(
                ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", video_path],
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT
            )
            return float(result.stdout)
        except (subprocess.SubprocessError, ValueError, FileNotFoundError) as e:
            print(f"Error getting video duration: {str(e)}")
            return -1

    def extract_document(self):
        # Load and process audio file
        if (self.youtube_url):
            video_path, video_name = self.download_youtube_video(self.youtube_url)
        elif (self.s3_video_url):
            video_path, video_name = self.download_s3_video(self.s3_video_url)
            
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
            duration=self.get_video_duration(video_path),
            mediaName=video_name,
        )
        chunks = [
            VideoTranscriptChunk(
                text=segment.text,
                title=video_name,
                document=document,
                metadata=VideoTranscriptMetadata(
                    start=segment.start,
                    end=segment.end,
                    word_segments=[segment.word_segments]
                )
            ) 
        for segment in segments]

        return document, chunks