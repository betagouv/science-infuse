import React, { useState, useCallback, useEffect } from 'react';
import { Editor } from '@tiptap/react';
import axios from 'axios';
import { ChunkWithScore } from '@/types';
import { NEXT_PUBLIC_SERVER_URL } from '@/config';
import Masonry from '@mui/lab/Masonry';
import VideoPlayer from '@/app/mediaViewers/VideoPlayer';
import { Button } from '@mui/material';
import { VideoNodeProps } from './VideoNode';
import { useDebounce } from 'use-debounce';

const getSIVideos = async (query: string) => {
  try {
    const response = await axios.post<ChunkWithScore<'video_transcript'>[]>(
      `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks`,
      {
        query: query,
        media_types: ["video_transcript"]
      }
    );
    const images = response.data;
    return images;
  } catch (error) {
    console.error("Error searching:", error);
  }
  return [];
};

const VideoSearchPopup = (props: { editor: Editor; closePopup: () => void }) => {
  const { editor, closePopup } = props;
  const [query, setQuery] = useState('');
  const [debouncedQuery] = useDebounce(query, 500); // Adjust the debounce delay as needed
  const [videos, setVideos] = useState<ChunkWithScore<'video_transcript'>[]>([]);

  const searchVideos = useCallback(async () => {
    const videos = await getSIVideos(debouncedQuery);
    setVideos(videos);
  }, [debouncedQuery]);

  useEffect(() => {
    if (debouncedQuery) {
      searchVideos();
    }
  }, [debouncedQuery, searchVideos]);

  const insertVideo = (props: VideoNodeProps) => {
    closePopup();
    editor
      .chain()
      .focus()
      .insertContentAt(editor.state.selection, { type: 'si-video', attrs: props })
      .run();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-2 w-full max-w-4xl mx-auto overflow-y-scroll h-[80vh] min-w-[calc(1000px-8rem)]">
      <input
        type="text"
        className="w-full p-2 border sticky top-0 bg-white z-10 border-gray-300 rounded mb-2"
        placeholder="Rechercher une video..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        autoFocus
      />
      <Masonry columns={2} spacing={2}>
        {videos.map((chunk, index) => {
          const duration = Math.floor(chunk.metadata.end - chunk.metadata.start);
          const videoUrl = `${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.document.s3_object_name}`;
          return (
            <div key={index} className="rounded-lg overflow-hidden shadow-lg bg-white">
              <div className="flex flex-col p-4">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                  {chunk.document.media_name}
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({duration} {duration > 1 ? "secondes" : "seconde"})
                  </span>
                </h3>
                <VideoPlayer
                  videoUrl={videoUrl}
                  startOffset={chunk.metadata.start}
                  endOffset={chunk.metadata.end}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => {
                    console.log('Button clicked for video:', chunk.document.media_name);
                    insertVideo({
                      startOffset: chunk.metadata.start,
                      endOffset: chunk.metadata.end,
                      videoUrl: videoUrl,
                      videoTitle: chunk.document.media_name
                    });
                  }}
                >
                  Insérer
                </Button>
              </div>
            </div>
          );
        })}
      </Masonry>
    </div>
  );
};

export default VideoSearchPopup;
