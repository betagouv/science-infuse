'use client'
import Image from 'next/image'
import React, { } from 'react';
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import { useParams, useRouter } from 'next/navigation';
import InteractiveVideoEditor from '../../InteractiveVideoEditor';
import { useQuery } from '@tanstack/react-query';
import { DocumentWithChunks, s3ToPublicUrl } from '@/types/vectordb';
import { apiClient } from '@/lib/api-client';
import { RenderGroupedVideoTranscriptCard, YoutubeEmbed } from '@/app/recherche/DocumentChunkFull';
import Button from '@codegouvfr/react-dsfr/Button';
import { groupVideo } from '@/app/recherche/RenderSearch';
import CallOut from '@codegouvfr/react-dsfr/CallOut';
import ShimmerText from '@/components/ShimmerText';
import Tile from '@codegouvfr/react-dsfr/Tile';
import styled from '@emotion/styled';
import InteractiveVideoHelpMessage from '../../InteractiveVideoHelpMessage';
import { useState } from '@preact-signals/safe-react/react';
import { InteractiveVideoGeneratorLoading, InteractiveVideoImportType } from '../../InteractiveVideoGenerator';
import H5PRenderer from '@/app/mediaViewers/H5PRenderer';


const StyledTile = styled(Tile)`
.fr-tile__header {
    display: none;
}
`


export default function () {
    const { id: documentId } = useParams() as { id: string };

    const [ivLoading, setIvLoading] = useState(false);
    const [ivGenerated, setIvGenerated] = useState(false);

    const [buttonClicked, setButtonClicked] = useState(false);
    const { data: video, isLoading, error } = useQuery({
        queryKey: ['document', documentId],
        queryFn: () => apiClient.getDocument(documentId)
    });


    return (
        <div className="w-full fr-grid-row fr-grid-row--gutters fr-grid-row--center">
            <div className="flex flex-col fr-container main-content-item my-8 gap-4">
                <Breadcrumb
                    currentPageLabel={documentId}
                    segments={[
                        { label: 'intelligence artificielle', linkProps: { href: '/intelligence-artificielle' } },
                        { label: 'Création de vidéo interactive', linkProps: { href: '/intelligence-artificielle/video-interactive' } },
                    ]}
                />

                {(!ivLoading && !ivGenerated) && <>

                    <h1>Création d'une vidéo interactive</h1>
                    <CallOut
                        iconId="ri-information-line"
                    >
                        Pour créer une vidéo interactive, suivez ces étapes :
                        <ol className="fr-mt-2w">
                            <li>Attendez le chargement de la vidéo ci-dessous</li>
                            <li>Cliquez sur le bouton "Générer quiz et définitions" pour analyser automatiquement le contenu</li>
                            <li>Vous pourrez ensuite personnaliser les interactions générées</li>
                        </ol>
                    </CallOut>

                    {isLoading ? (
                        <div className="w-full flex items-center justify-center flex-col p-8">
                            <img className="aspect-square w-16 mb-0" src="https://portailpro.gouv.fr/assets/spinner-9a2a6d7a.gif" alt="Chargement" />
                            <ShimmerText
                                className="text-[1.1rem] font-thin"
                                text="Chargement de la vidéo..."
                                gradientColors="from-gray-600 via-gray-400 to-gray-600"
                            />

                        </div>
                    ) : video && (
                        <div className="flex flex-col md:flex-row w-full gap-4 items-center justify-center">
                            <div className="flex max-w-full">
                                <RenderGroupedVideoTranscriptCard
                                    video={groupVideo(video.chunks.filter(c => c.mediaType === "video_transcript").map(c => ({ ...c, mediaType: "video_transcript" as const, score: 0 })))[0]}
                                    searchWords={[]} />
                            </div>
                            <div
                                className='h-full w-full bg-[#f5f5fe] shadow-[0_0_0_1px_#dddddd]'>
                                <div className='flex flex-col h-full text-start justify-between'>
                                    <InteractiveVideoHelpMessage hideNeedHelp={true} />
                                    <Button onClick={() => {
                                        window.scrollTo(0, 0);
                                        setButtonClicked(true)
                                        setIvLoading(true)
                                        setIvGenerated(false);
                                    }}
                                        className='m-4  ml-auto'>Générer quiz et définitions</Button>

                                </div>
                            </div>

                        </div>
                    )}
                </>}


                {documentId && buttonClicked &&
                    <InteractiveVideoEditor
                        onDocumentProcessingEnd={() => {
                            setIvLoading(false);
                            setIvGenerated(true);
                        }}
                        onBackClicked={() => {
                            setIvLoading(false);
                            setButtonClicked(false);
                            setIvGenerated(false);
                        }}
                        documentId={documentId} />}
                {ivLoading && <InteractiveVideoGeneratorLoading importType={InteractiveVideoImportType.RECHERCHE} />}
            </div>
        </div>
    );
}