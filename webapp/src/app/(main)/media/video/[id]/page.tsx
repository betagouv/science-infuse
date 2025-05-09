'use client';
import { useMemo, useState, useRef } from "react";
import React from "react";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { RenderGroupedVideoTranscriptCard, YoutubeEmbed, YouTubePlayerRef } from "@/app/(main)/recherche/DocumentChunkFull";
import { ChunkWithScore, s3ToPublicUrl } from "@/types/vectordb";
import CallOut from "@codegouvfr/react-dsfr/CallOut";
import RegisteredUserFeature from "@/components/RegisteredUserFeature";
import { CircularProgress } from "@mui/material";
import MiniatureWrapper from "./MiniatureWrapper";
import { Button } from "@codegouvfr/react-dsfr/Button";


export default function VideoPage({
    params,
}: {
    params: { id: string },
}) {

    const { id } = params;
    const videoRef = useRef<HTMLVideoElement>(null);
    const youtubePlayerRef = useRef<YouTubePlayerRef>(null);

    const [selectedChunk, setSelectedChunk] = useState<ChunkWithScore<"video_transcript"> | undefined>(undefined);
    const { data: video, isLoading, error } = useQuery({
        queryKey: ['document', id],
        queryFn: () => apiClient.getDocument(id)
    });


    const videoChunks = video ? video.chunks
        .filter(c => c.mediaType == "video_transcript")
        .sort((a, b) => a.metadata.start - b.metadata.start)
        : [];

    const seekToDuration = (timestamp: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = timestamp;
            videoRef.current.play();
        }
        if (youtubePlayerRef.current) {
            youtubePlayerRef.current.seekToTime(timestamp);
        }
    }

    const textLength = (videoChunks || []).map(i => i.text).join(' ').length;

    return <div className="w-full fr-grid-row fr-grid-row--center">
        <div className="fr-col-12 md:fr-col-8 fr-container main-content-item my-8">
            {isLoading && <div className="flex min-h-64 w-full items-center justify-center"><CircularProgress className="" /></div>}
            {error && <RegisteredUserFeature message={<span>Erreur lors du chargement du document. <br /> Veuillez vous authentifier pour visualiser le contenu</span>} />}

            {video && <div className="flex w-full flex-col gap-8">

                <h1>{video?.mediaName}</h1>
                {/* <MiniatureWrapper> */}
                {video && (
                    video.isExternal ?
                        <YoutubeEmbed ref={youtubePlayerRef} onDuration={() => { }} url={video.originalPath} />
                        : <video className="w-full" ref={videoRef} controls controlsList="nodownload" src={s3ToPublicUrl(video.s3ObjectName || "")} />
                )}
                {/* </MiniatureWrapper> */}

                {video && <>
                    <h2 className="m-0">Vidéo interactive</h2>
                    <div className="relative w-full">
                        {textLength < 100000 ?
                            <Button linkProps={{target: "_blank", href: `/intelligence-artificielle/video-interactive/document/${video.id}`}} >Générer une vidéo interactive</Button> :
                            <CallOut
                                iconId="ri-information-line"
                                title="Génération impossible"
                            >
                                Cette vidéo est trop longue pour permettre la génération d'une version interactive. Vous pouvez essayer avec une vidéo plus courte.
                            </CallOut>

                        }
                    </div>
                </>
                }

                <h2 className="m-0">Transcription</h2>
                <div className="flex flex-col gap-0">
                    {videoChunks && videoChunks
                        .map((c) => {
                            return (
                                <div key={c.id}>
                                    <p><span onClick={() => seekToDuration(c.metadata.start)} style={{ cursor: 'pointer' }} aria-hidden="true"><b>[{Math.floor(c.metadata.start / 60)}:{String(Math.floor(c.metadata.start % 60)).padStart(2, '0')}]</b></span> {c.text}</p>
                                </div>
                            )
                        })}
                </div>
            </div>}
        </div>
    </div>
}
