from googleapiclient.discovery import build
import os
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

# Fetch the videos
channel_id = "UC3E2DhYIqnoc6H3WXwTVnlA"
channel_videos = get_channel_videos(channel_id)

# Print the results
for video in channel_videos:
    print(f"Title: {video['title']}")
    print(f"Video ID: {video['video_id']}")
    print(f"Publish Time: {video['publish_time']}")
    print("---")