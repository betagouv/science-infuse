import React from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import VideoPlayer from '@/app/mediaViewers/VideoPlayer';

interface VideoNodeProps {
  videoUrl: string;
  videoTitle: string;
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

  return (
    <NodeViewWrapper className="si-video border-solid border-2 border-blue-200 p-4 rounded-lg">
      <h2 className="text-xl font-bold mb-2">{(node.attrs as VideoNodeProps).videoTitle}</h2>
      <VideoPlayer
        videoUrl={(node.attrs as VideoNodeProps).videoUrl}
        startOffset={(node.attrs as VideoNodeProps).startOffset}
        endOffset={(node.attrs as VideoNodeProps).endOffset}
        onRangeChange={handleRangeChange}
      />
    </NodeViewWrapper>
  );
}