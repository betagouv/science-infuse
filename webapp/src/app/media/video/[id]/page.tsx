'use client';
import { useMemo, useState } from "react";
import React from "react";
import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";
import { RenderGroupedVideoTranscriptCard } from "@/app/recherche/DocumentChunkFull";
import { ChunkWithScore } from "@/types/vectordb";
import { generateInteraciveVideoData, InteractiveVideoQuestionGroup } from "@/app/api/export/h5p/contents/interactiveVideo";
import Button from "@codegouvfr/react-dsfr/Button";
import InteractiveVideoGenerator from "@/components/interactifs/InteractiveVideoGenerator";
import MiniatureWrapper from './MiniatureWrapper'


export default function VideoPage({
    params,
}: {
    params: { id: string },
}) {

    const { id } = params;
    const [selectedChunk, setSelectedChunk] = useState<ChunkWithScore<"video_transcript"> | undefined>(undefined);
    const { data: video, isLoading, error } = useQuery({
        queryKey: ['document', id],
        queryFn: () => apiClient.getDocument(id)
    });

    const groupedVideo = useMemo(() => {
        if (!video) return undefined;
        return {
            documentId: id,
            items: video.chunks
                .filter(c => c.mediaType == "video_transcript")
                .sort((a, b) => a.metadata.start - b.metadata.start)
                .map((c, index) => ({ ...c, score: index === 0 ? 1 : 0.99 })),
            maxScore: 1
        };
    }, [video, id]);

    return <div className="w-full fr-grid-row fr-grid-row--center">
        <div className="fr-col-8 fr-container main-content-item my-8">
            {isLoading && <div>Chargement...</div>}
            {error && <div>Erreur lors du chargement du document</div>}

            {groupedVideo && <div className="flex w-full flex-col gap-8">

                <h1>{video?.mediaName}</h1>
                {/* <MiniatureWrapper> */}
                    <RenderGroupedVideoTranscriptCard
                        defaultSelectedChunk={selectedChunk}
                        video={groupedVideo}
                        searchWords={[]}
                    />
                {/* </MiniatureWrapper> */}

                <div className="relative w-full bg-[#f6f6f6] p-8 rounded-xl">
                    {video && <InteractiveVideoGenerator video={video} />}
                </div>

                <h2 className="m-0">Transcription</h2>
                <div className="flex flex-col gap-0">
                    {groupedVideo.items
                        .sort((a, b) => a.metadata.start - b.metadata.start)
                        .map((c) => {
                            return (
                                <div key={c.id}>
                                    <p><span onClick={() => setSelectedChunk(c)} style={{ cursor: 'pointer' }} aria-hidden="true"><b>[{Math.floor(c.metadata.start / 60)}:{String(Math.floor(c.metadata.start % 60)).padStart(2, '0')}]</b></span> {c.text}</p>
                                </div>
                            )
                        })}
                </div>
            </div>}
        </div>
    </div>
}