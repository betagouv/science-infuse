import React, { useRef, useEffect } from 'react';

interface VideoPlayerProps {
    videoUrl: string;
    startOffset: number;
    endOffset: number;
}

const VideoPlayer = ({ videoUrl, startOffset, endOffset }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoadedMetadata = () => {
                video.currentTime = startOffset; // Start at specified offset
            };

            const handleTimeUpdate = () => {
                if (video.currentTime >= endOffset) {
                    video.pause(); // Stop at specified offset
                }
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [startOffset, endOffset]);

    return (
        <video className='w-full' ref={videoRef} controls>
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    );
};

export default VideoPlayer;