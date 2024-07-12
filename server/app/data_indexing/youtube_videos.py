from googleapiclient.discovery import build
import os
import sys
sys.path.append(os.path.join(os.getcwd(), 'app'))

from S3Storage import S3Storage
from SIWeaviateClient import SIWeaviateClient
from weaviate import WeaviateClient
from weaviate.classes.query import Filter, GeoCoordinate, MetadataQuery, QueryReference

from processing.YoutubeProcessor import YoutubeProcessor
from processing.audio.SIWhisperModel import SIWhisperModel 
from pytube import YouTube

# Replace with your own API key
api_key = os.environ.get('YOUTUBE_API_KEY', '')

# Create a YouTube API client
youtube = build("youtube", "v3", developerKey=api_key)

# Replace with the channel ID you want to fetch videos from
# LE BLOB
def get_channel_videos(channel_id):
    videos = []
    next_page_token = None
    
    while True:
        request = youtube.search().list(
            part="snippet",
            channelId=channel_id,
            maxResults=50,
            type="video",
            pageToken=next_page_token
        )
        response = request.execute()
        
        for item in response["items"]:
            videos.append({
                "title": item["snippet"]["title"],
                "video_id": item["id"]["videoId"],
                "publish_time": item["snippet"]["publishTime"]
            })
        
        next_page_token = response.get("nextPageToken")
        break        
        if not next_page_token:
            break
    
    return videos


def is_url_already_indexed(url, client: WeaviateClient):
    document = client.collections.get("Document")
    response = document.query.fetch_objects(
        filters=(
            Filter.by_property("original_path").equal(url)
        ),
        limit=1,
        return_properties=[]
    )
    return len(response.objects) > 0


whisper = SIWhisperModel('medium', 'whisper-medium')
MAX_VIDEO_LENGTH_SECONDS = 60*1 #1 hour
# MAX_VIDEO_LENGTH_SECONDS = 60*60*1 #1 hour

def index_channel(channel_id: str):
    channel_videos = get_channel_videos(channel_id)
    
    s3 = S3Storage()
    with SIWeaviateClient() as client:
        for i, video in enumerate(channel_videos):
            print(f"video {i}/{len(channel_videos)}")          
            url = f"https://www.youtube.com/watch?v={video['video_id']}"
            # yt = YouTube(url)
            # if (yt.length > MAX_VIDEO_LENGTH_SECONDS):
                # print(f"Video Too Long, SKIP INDEXING {url}")
                # continue

            print(f"Title: {video['title']}")
            print(f"Video ID: {video['video_id']}")
            # print('indexing....')
            
            for i in range(10):
                if (is_url_already_indexed(url, client)):
                    print(f"Already in DB, SKIP INDEXING {url}")
                    continue
                try:
                    YoutubeProcessor(s3=s3,client=client, whisper=whisper, youtube_url=url)
                    print("---")
                    break
                except:
                    if i == 9:
                        raise Exception("Failed after 10 retries")
                    continue    
    s3.s3_client.close()
    
# Fetch the videos
channel_le_blob = "UC3E2DhYIqnoc6H3WXwTVnlA"
channel_citedessciences = "UC2RSe5ZktAjE3qoMKi2pA_g"
channel_palaisdeladecouverte = "UC1udnO-W6gpR9qzleJ5SDKw"

index_channel(channel_le_blob)
index_channel(channel_citedessciences)
index_channel(channel_palaisdeladecouverte)
