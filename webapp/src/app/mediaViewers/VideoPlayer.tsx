import React, { useRef, useEffect, useState } from 'react';
import { Slider, IconButton, Box, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ReplayIcon from '@mui/icons-material/Replay';

interface VideoPlayerProps {
    videoUrl: string;
    startOffset: number;
    endOffset: number;
    onRangeChange?: (start: number, end: number) => void;
}

const VideoPlayer = ({ videoUrl, startOffset, endOffset, onRangeChange }: VideoPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [duration, setDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(startOffset);
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
                if (isPlaying && video.currentTime >= range[1]) {
                    video.pause();
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
    }, [range, isPlaying]);

    const handleGlobalRangeChange = (event: Event, newValue: number | number[]) => {
        const newTime = newValue as number;
        if (videoRef.current) {
            videoRef.current.currentTime = newTime;
        }
    };

    const handleSpecificRangeChange = (event: Event, newValue: number | number[]) => {
        const [start, end] = newValue as number[];
        setRange([start, end]);
        if (onRangeChange) {
            onRangeChange(start, end);
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
                if (videoRef.current.currentTime < range[0] || videoRef.current.currentTime >= range[1]) {
                    videoRef.current.currentTime = range[0];
                }
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

    return (
        <div className="video-player-container">
            <video className="w-full" ref={videoRef} controls={false}>
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
            <Box sx={{ padding: 1, bgcolor: 'rgba(0, 0, 0, 0.7)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <IconButton onClick={handlePlayPause} sx={{ color: 'white', padding: 0.5 }}>
                        {isPlaying ? <PauseIcon fontSize="small" /> : <PlayArrowIcon fontSize="small" />}
                    </IconButton>
                    <IconButton onClick={handleReplay} sx={{ color: 'white', padding: 0.5 }}>
                        <ReplayIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="caption" sx={{ ml: 1, color: 'white' }}>
                        {formatTime(currentTime)} / {formatTime(duration)}
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'white', width: 60, flexShrink: 0 }}>
                    </Typography>
                    <Slider
                        value={currentTime}
                        onChange={handleGlobalRangeChange}
                        min={0}
                        max={duration}
                        step={0.1}
                        size="small"
                        sx={{
                            color: 'rgba(255, 255, 255, 0.7)',
                            padding: '5px 0',
                            '& .MuiSlider-thumb': {
                                width: 12,
                                height: 12,
                            },
                        }}
                    />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="caption" sx={{ color: 'white', width: 60, flexShrink: 0 }}>
                        Section
                    </Typography>
                    <Slider
                        value={range}
                        onChange={handleSpecificRangeChange}
                        valueLabelDisplay="auto"
                        valueLabelFormat={formatTime}
                        min={0}
                        max={duration}
                        disableSwap
                        size="small"
                        sx={{
                            color: 'primary.main',
                            padding: '5px 0',
                            '& .MuiSlider-thumb': {
                                width: 12,
                                height: 12,
                            },
                        }}
                    />
                </Box>
            </Box>
        </div>
    );
};

export default VideoPlayer;