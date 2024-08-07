import React, { useState } from 'react';
import { NodeViewWrapper, NodeViewProps } from '@tiptap/react';
import VideoPlayer from '@/app/mediaViewers/VideoPlayer';
import { useEffect } from '@preact-signals/safe-react/react';

export interface VideoNodeProps {
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

  let [mounted, setMounted] = useState(false);
  useEffect(() => {
    setTimeout(() => {
      setMounted(true);
    }, 400)
  }, [])

  return (
    <NodeViewWrapper style={{ opacity: mounted ? 1 : 0 }} className="si-video sm:rounded-xl sm:border sm:shadow-lg overflow-hidden my-4 p-4 relative">
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