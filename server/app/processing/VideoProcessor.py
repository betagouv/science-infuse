import json
import subprocess
from typing import Optional
from S3Storage import S3Storage
from processing.BaseDocumentProcessor import BaseDocumentProcessor
from processing.audio.SIWhisperModel import SIWhisperModel, TranscriptSegment
# from pytube import YouTube
from pytubefix import YouTube
import os

from schemas import Document, DocumentWithChunks, VideoTranscriptChunk, VideoTranscriptMetadata

class VideoProcessor(BaseDocumentProcessor):
    def __init__(self, whisper: SIWhisperModel, s3: S3Storage, name: Optional[str]=None, youtube_url: Optional[str]=None, s3_object_name: Optional[str]=None, paragraph_pause_threshold: float = 1, use_oauth: bool = False):
        self.whisper = whisper
        self.youtube_url = youtube_url
        self.name = name
        self.s3_object_name = s3_object_name
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

    def regenerate_po_token(self, path):
        try:
            import requests
            response = requests.get(os.environ.get("YOUTUBE_TOKEN_GENERATOR_URL"))
            data = response.json()
            print("PO TOKENNN", data)
            with open(path, "w") as f:
                f.write(json.dumps({"access_token": None, "refresh_token": None, "expires": None, "visitorData": data.get('visitor_data'), "po_token": data.get('potoken')}))
        except requests.RequestException as e:
            print(f"Error fetching token: {str(e)}")

    def download_youtube_video(self, youtube_url):
        po_token_path = "./potoken.json"
        print("PO TOKEN PATH:", po_token_path)
        if os.path.exists(po_token_path):
            with open(po_token_path, 'r') as f:
                print("PO TOKEN CONTENT:", f.read())

        output_path = os.path.join(self.base_download_folder, 'youtube')
        os.makedirs(output_path, exist_ok=True)
        filename = f"{self.id}.mp4"
        file_path = os.path.join(output_path, filename)

        if not os.path.exists(po_token_path):
            self.regenerate_po_token(po_token_path)

        try:
            yt = YouTube(youtube_url, proxies=self.proxies, use_po_token=True, token_file=po_token_path, allow_oauth_cache=True)
            print("YT", yt)
            video_name = yt.vid_info.get("videoDetails", {}).get("title", "Untitled Video")
        except Exception as e:
            print(f"First attempt failed: {str(e)}")
            self.regenerate_po_token(po_token_path)
            yt = YouTube(youtube_url, proxies=self.proxies, use_po_token=True, token_file=po_token_path, allow_oauth_cache=True)
            print("YT", yt)
            video_name = yt.vid_info.get("videoDetails", {}).get("title", "Untitled Video")

        yt.streams.filter(progressive=True, file_extension='mp4').order_by('resolution').desc().first().download(output_path=output_path, filename=filename)
        return file_path, video_name    

    def download_s3_video(self, s3_object_name):
        output_path = os.path.join(self.base_download_folder, 'temp_videos')
        os.makedirs(output_path, exist_ok=True)
        filename = f"{self.id}.mp4"
        file_path = os.path.join(output_path, filename)
        if self.s3.download_file(object_name=s3_object_name, local_file_path=file_path) is True:
            return file_path, s3_object_name
        return None, None

    def get_video_duration(self, video_path):
        try:
            print(f"get_video_duration -> Video path: {video_path}")  # Debugging line
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
            video_s3ObjectName = f"youtube/{self.get_random_uuid()}.mp4"
            # print("SAVED YT VIDEO TO ", video_s3ObjectName, flush=True)
            self.save_to_s3(self.s3, video_path, video_s3ObjectName, remove=False)
        elif (self.s3_object_name):
            video_path, video_name = self.download_s3_video(self.s3_object_name)
            video_s3ObjectName = self.s3_object_name
            
        # print("EXTRACT DOCUMNET YOUTUBE video_s3ObjectName 1", video_s3ObjectName)
        # save video to s3
        self.whisper.set_paragraph_pause_threshold(self.paragraph_pause_threshold)
        segments = self.whisper.get_paragraphs_from_audio_path(video_path)

        # print("EXTRACT DOCUMNET YOUTUBE video_s3ObjectName 2", video_s3ObjectName)

        # print("segment.word_segments", type(segments[0].word_segments[0]), segments[0].word_segments[0])
        document = Document(
            id=self.id, 
            publicPath=self.youtube_url, 
            originalPath=self.youtube_url or self.s3_object_name,
            s3ObjectName=video_s3ObjectName,
            duration=self.get_video_duration(video_path),
            mediaName=self.name or video_name,
        )
        # print("RETURNN DOCUMENT", document.dict(), flush=True)
        chunks = [
            VideoTranscriptChunk(
                text=segment.text,
                title=self.name or video_name,
                document=document,
                metadata=VideoTranscriptMetadata(
                    start=segment.start,
                    end=segment.end,
                    word_segments=[word_segment.dict() for word_segment in segment.word_segments]
                )
            ) 
        for segment in segments]
        
        # if (self.s3_object_name):
        os.remove(video_path)


        return document, chunks