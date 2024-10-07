import { ChunkWithScore } from '@/types/vectordb';
import { Tooltip } from '@mui/material';
import React, { useState, useRef, useEffect } from 'react';

export interface VideoPlayerProps {
    videoUrl: string;
    chunks: ChunkWithScore<"video_transcript">[];
    selectedChunk: ChunkWithScore<"video_transcript"> | undefined,
    onChunkSelected: (chunk: ChunkWithScore<"video_transcript"> | undefined) => void
}

const VideoPlayerHotSpots: React.FC<VideoPlayerProps> = ({ videoUrl, chunks, selectedChunk, onChunkSelected }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    // Add hover section red local state
    const [hoveredVideoChunk, setHoveredVideoChunk] = useState<ChunkWithScore<"video_transcript"> | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => {
            setCurrentTime(video.currentTime)
            const sortedChunks = chunks.slice().sort((a, b) => a.metadata.start - b.metadata.start);

            const closestChunk: ChunkWithScore<"video_transcript"> | undefined = sortedChunks.reduce((prev: ChunkWithScore<"video_transcript"> | undefined, curr) => {
                if (curr.metadata.start-1 <= video.currentTime) {
                    return curr;
                }
                return prev;
            }, undefined);
            if (closestChunk?.id != selectedChunk)
                onChunkSelected(closestChunk)
        };
        const updateDuration = () => setDuration(video.duration);

        const onVideoLoaded = () => {
            if (chunks.length >= 1) {
                const greatestScoreChunk = chunks.reduce((prev, current) =>
                    (prev.score > current.score) ? prev : current
                );
                console.log("greatestScoreChunk", greatestScoreChunk)
                handleHotspotClick(greatestScoreChunk);
            }
        };


        video.addEventListener('timeupdate', updateTime);
        video.addEventListener('loadedmetadata', updateDuration);
        video.addEventListener('loadeddata', onVideoLoaded);



        return () => {
            video.removeEventListener('timeupdate', updateTime);
            video.removeEventListener('loadedmetadata', updateDuration);
            video.removeEventListener('loadeddata', onVideoLoaded);
        };

    }, []);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const video = videoRef.current;
        if (!video) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const seekTime = (x / rect.width) * duration;
        video.currentTime = seekTime;
    };

    const handleHotspotClick = (chunk: ChunkWithScore<"video_transcript">) => {
        if (videoRef.current) {
            videoRef.current.currentTime = chunk.metadata.start;
        }
        onChunkSelected(chunk);
    };

    return (
        <div className="w-full mx-auto">
            <video ref={videoRef} src={videoUrl} className="w-full sm:rounded-xl" controls />
            <div className="relative h-[5px] bg-gray-200 mt-2 cursor-pointer" onClick={handleSeek}>
                <div
                    className="absolute top-0 left-0 h-full bg-blue-500"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                />
                {(hoveredVideoChunk || selectedChunk) && (
                    <div
                        className={`absolute top-[0px] h-[5px] rounded-full transform cursor-pointer`}
                        style={{
                            background: "red",
                            opacity: 0.6,
                            left: `${((hoveredVideoChunk || selectedChunk)!.metadata.start / duration) * 100}%`,
                            width: `${(((hoveredVideoChunk || selectedChunk)!.metadata.end - (hoveredVideoChunk || selectedChunk)!.metadata.start) / duration) * 100}%`,
                        }}
                    >
                    </div>
                )}
                {chunks
                    .sort((a, b) => b.score - a.score)
                    .filter(c => c.metadata)
                    // at least 4
                    // and the best 20%
                    // .slice(0, Math.max(4, Math.min(Math.floor(chunks.length * 0.2), chunks.length)))
                    .map((chunk, index) => {
                        const chunkId = chunk.id;
                        const start = chunk.metadata.start;
                        const end = chunk.metadata.end;
                        const text = chunk.text.length > 200 ? chunk.text.slice(0, 100) + ' [...] ' + chunk.text.slice(-100) : chunk.text;
                        const score = chunk.score;
                        const selected = chunkId == selectedChunk?.id;
                        const starred = !!chunk.user_starred;
                        return (
                            <Tooltip key={chunk.id} title={`${text}`}>
                                <div
                                    key={chunkId}
                                    className={`absolute top-[2.5px] w-2 h-2 rounded-full transform -translate-y-1/2 cursor-pointer`}
                                    style={{
                                        left: `${(start / duration) * 100}%`,
                                        backgroundColor: starred ? '#f7d000' : selected ? 'black' : `rgb(${255 - (score * 1.5) * 255}, ${255 - (score * 1.5) * 255}, ${255 - (score * 1.5) * 255})`,
                                        zIndex: starred ? 1001 : Math.floor(score * 1000),
                                        outline: `${selected ? '2px solid black' : 'none'}`,
                                        border: `${selected ? '2px solid white' : 'none'}`
                                    }}
                                    onMouseOver={() => { setHoveredVideoChunk(chunk) }}
                                    onMouseLeave={() => { setHoveredVideoChunk(null) }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleHotspotClick(chunk);
                                    }}
                                />
                            </Tooltip>
                        )
                    })
                }
            </div>
        </div>
    );
};

export default VideoPlayerHotSpots;