import React, { useRef, useEffect, useState } from 'react';
import { Slider, IconButton } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';

export interface VideoPlayerProps {
    videoUrl: string;
    startOffset: number;
    endOffset: number;
    onRangeChange?: (start: number, end: number) => void;
}

const VideoPlayer = ({ videoUrl, startOffset, endOffset, onRangeChange }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [range, setRange] = useState<[number, number]>([startOffset, endOffset]);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    useEffect(() => {
        const video = videoRef.current;
        if (video) {
            const handleLoadedMetadata = () => {
                setDuration(video.duration);
                video.currentTime = range[0];
            };

            const handleTimeUpdate = () => {
                setCurrentTime(video.currentTime);
                if (video.currentTime >= range[1]) {
                    video.pause();
                    video.currentTime = range[1];
                    setIsPlaying(false);
                }
            };

            video.addEventListener('loadedmetadata', handleLoadedMetadata);
            video.addEventListener('timeupdate', handleTimeUpdate);

            return () => {
                video.removeEventListener('loadedmetadata', handleLoadedMetadata);
                video.removeEventListener('timeupdate', handleTimeUpdate);
            };
        }
    }, [range]);

    useEffect(() => {
        updatePreviewFrame(range[1]);
    }, [range]);

    const handleRangeChange = (event: Event, newValue: number | number[]) => {
        const [start, end] = newValue as number[];
        setRange([start, end]);
        if (onRangeChange) {
            onRangeChange(start, end);
        }
        if (videoRef.current) {
            videoRef.current.currentTime = start;
        }
        updatePreviewFrame(end);
    };

    const updatePreviewFrame = (time: number) => {
        const video = videoRef.current;
        const canvas = previewCanvasRef.current;
        if (video && canvas) {
            video.currentTime = time;
            video.onseeked = () => {
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                }
            };
        }
    };

    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleReplay = () => {
        if (videoRef.current) {
            videoRef.current.currentTime = range[0];
            videoRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleTimelineClick = (event: React.MouseEvent<HTMLDivElement>) => {
        const timelineRect = event.currentTarget.getBoundingClientRect();
        const clickPosition = (event.clientX - timelineRect.left) / timelineRect.width;
        const newTime = duration * clickPosition;
        if (videoRef.current) {
            videoRef.current.currentTime = Math.max(range[0], Math.min(range[1], newTime));
        }
    };

    return (
        <div className="video-player-container relative">
            <video className="w-full" ref={videoRef} controls={!onRangeChange}>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            {onRangeChange &&
                <div className="overlay absolute inset-x-0 bottom-0 bg-white bg-opacity-50 text-white p-4">
                    <div className="flex items-center mb-2">
                        <IconButton onClick={handlePlayPause} color="primary">
                            {isPlaying ? <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                        {true &&  (
                        // {currentTime >= range[1] && (
                            <IconButton onClick={handleReplay} color="primary">
                                <ReplayIcon />
                            </IconButton>
                        )}
                        <div className="flex-grow mx-2" onClick={handleTimelineClick}>
                            <Slider
                                value={range}
                                onChange={handleRangeChange}
                                valueLabelDisplay="auto"
                                valueLabelFormat={formatTime}
                                min={0}
                                max={duration}
                                sx={{
                                    color: 'primary.main',
                                    '& .MuiSlider-thumb': {
                                        height: 20,
                                        width: 20,
                                        backgroundColor: '#fff',
                                        border: '2px solid currentColor',
                                        '&:focus, &:hover, &.Mui-active': {
                                            boxShadow: '0 0 0 8px rgba(255, 255, 255, 0.16)',
                                        },
                                    },
                                    '& .MuiSlider-rail': {
                                        opacity: 0.28,
                                    },
                                }}
                            />
                        </div>
                    </div>
                    <div className="absolute right-4 top-[-68px]">
                        <canvas ref={previewCanvasRef} width="120" height="68" className="border border-white" />
                    </div>
                </div>
            }
        </div>
    );
};

export default VideoPlayer;