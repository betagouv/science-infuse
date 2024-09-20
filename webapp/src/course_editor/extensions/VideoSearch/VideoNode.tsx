import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import VideoPlayer from '@/app/mediaViewers/VideoPlayer';
import { useEffect } from '@preact-signals/safe-react/react';
import VideoPlayerHotSpots from '@/app/mediaViewers/VideoPlayerHotSpots';
import { ChunkWithScore } from '@/types/vectordb';
import { WEBAPP_URL } from '@/config';

export interface VideoNodeProps {
  chunk: ChunkWithScore<'video_transcript'>,
  startOffset: number;
  endOffset: number;
}

export default function VideoNodeComponent({ node, updateAttributes }: NodeViewProps) {
  const handleRangeChange = (start: number, end: number) => {
    updateAttributes({
      startOffset: start,
      endOffset: end,
    });
  };

  let [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 400)
  }, [])
  const attrs = node.attrs as VideoNodeProps;
  const videoUrl = `${WEBAPP_URL}/api/s3/presigned_url/object_name/${attrs.chunk?.document?.s3ObjectName}`;
console.log("NODE ATTRS", node, node?.attrs)
  return (
    <NodeViewWrapper style={{ opacity: mounted ? 1 : 0 }} className="si-video sm:rounded-xl sm:border sm:shadow-lg overflow-hidden my-4 p-4 relative">
      <h2 className="text-xl font-bold mb-2">{attrs.chunk?.title}</h2>
      
      {attrs.chunk && <VideoPlayerHotSpots
        videoUrl={videoUrl}
        chunks={[attrs.chunk]}
        selectedChunk={undefined}
        onChunkSelected={function (chunk: ChunkWithScore<'video_transcript'> | undefined): void {
        }}
      />}
    </NodeViewWrapper>
  );
}