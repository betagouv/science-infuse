import React, { useState } from "react";
import { Quote } from "@codegouvfr/react-dsfr/Quote";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { ChunkWithScore, ChunkWithScoreUnion, DocumentChunk, GroupedVideo, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, isWebsiteExperienceChunk, isWebsiteQAChunk } from "@/types/vectordb";
import { findNormalizedChunks } from "../text-highlighter";
import Highlighter from "react-highlight-words";
import { NEXT_PUBLIC_FILE_SERVER_URL, NEXT_PUBLIC_SERVER_URL } from "@/config";
import VideoPlayer from "@/app/mediaViewers/VideoPlayer";
import { Typography, Collapse, Tooltip, styled } from '@mui/material';
import Badge from "@codegouvfr/react-dsfr/Badge";
// import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
import axios from "axios";
import { useCollapse } from 'react-collapsed'
import { Breadcrumb } from "@codegouvfr/react-dsfr/Breadcrumb";
import BreadcrumbNoLink from "@/ui/BreadcrumbNoLink";
import { apiClient } from "@/lib/api-client";
import { useSnackbar } from "@/app/SnackBarProvider";
import { useSearchParams } from "next/navigation";
import VideoPlayerHotSpots from "@/app/mediaViewers/VideoPlayerHotSpots";

const StyledCardWithoutTitle = styled(Card)`
.fr-card__content {
    padding: 1rem;
    padding-top: 0;
}

.fr-card__title {
    display: none;
}
`

const StyledGroupedVideoCard = styled(StyledCardWithoutTitle)`
.fr-card__body,
.fr-card__content,
.fr-card__desc,
.fr-card__start {
    margin: 0;
    padding: 0;
};

.fr-card__end {
    padding: 1rem;
}

.fr-card__body {
    overflow: hidden;
}

`

const StyledImageCard = styled(StyledCardWithoutTitle)`
a {
    filter: none;
}
.fr-responsive-img {
    object-fit: contain;
    background-color: #f6f6f6;
}
`

// Types
type BaseCardProps = {
    chunk: ChunkWithScoreUnion;
    children: React.ReactNode;
    end?: React.ReactNode;
    title?: string;
    linkProps?: {
        href: string;
        target: string;
    };
    badgeText?: string;
    badgeSeverity?: "new" | "info" | "success" | "warning" | "error";
};

type ChunkRendererProps = {
    chunk: ChunkWithScoreUnion;
    searchWords: string[];
};

export const getColorFromScore = (score: number) => {
    const clampedScore = Math.max(0, Math.min(1, score));
    const hue = clampedScore * 120;
    return `hsl(${hue}, 100%, 50%)`;
}

const Star = (props: { query: string, chunkId: string, starred: boolean }) => {
    const [starred, setStarred] = useState(props.starred);
    const { showSnackbar } = useSnackbar();

    const starDocumentChunk = async () => {
        await apiClient.starDocumentChunk({ documentChunkId: props.chunkId, keyword: props.query })
        setStarred(true);
        showSnackbar(
            <p className="m-0">Favori ajouté avec succès</p>,
            'success'
        )
    }

    const unStarDocumentChunk = async () => {
        await apiClient.unStarDocumentChunk({ documentChunkId: props.chunkId })
        setStarred(false);
        showSnackbar(
            <p className="m-0">Favori supprimé avec succès</p>,
            'success'
        )

    }
    return <Tooltip title={props.starred ? "Supprimer des favoris" : "Ajouter aux favoris"}>
        {starred ? <svg onClick={unStarDocumentChunk} className="cursor-pointer" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9999 18.26L4.94691 22.208L6.52191 14.28L0.586914 8.792L8.61391 7.84L11.9999 0.5L15.3859 7.84L23.4129 8.792L17.4779 14.28L19.0529 22.208L11.9999 18.26Z" fill="#161616" />
        </svg> : <svg onClick={starDocumentChunk} className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9999 0.5L15.3859 7.84L23.4129 8.792L17.4779 14.28L19.0529 22.208L11.9999 18.26L4.94691 22.208L6.52191 14.28L0.586914 8.792L8.61391 7.84L11.9999 0.5ZM11.9999 5.275L9.96191 9.695L5.12891 10.267L8.70191 13.572L7.75291 18.345L11.9999 15.968L16.2469 18.345L15.2979 13.572L18.8709 10.267L14.0379 9.694L11.9999 5.275Z" fill="#161616" />
        </svg>}
    </Tooltip>
}

const BuildCardEnd = (props: { chunk: ChunkWithScoreUnion, end?: React.ReactNode, downloadLink?: string, starred: boolean | undefined }) => {
    const searchParams = useSearchParams();
    const query = searchParams.get('query') || "";
    return (
        <div className="flex flex-row justify-between gap-4">
            {props.end}
            <div className="flex self-end gap-4 ml-auto">
                {props.starred != undefined && <Star key={props.chunk.id} query={query} chunkId={props.chunk.id} starred={props.starred} />}
                {
                    props.downloadLink && <button
                        onClick={() => window.open(props.downloadLink, '_blank')}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M3 19H21V21H3V19ZM13 13.172L19.071 7.1L20.485 8.514L12 17L3.515 8.515L4.929 7.1L11 13.17V2H13V13.172Z" fill="#161616" />
                        </svg>
                    </button>
                }

            </div>
        </div>
    )
}

// Base Card component
export const BaseCard: React.FC<BaseCardProps> = ({ end, children, title, linkProps, chunk, badgeText, badgeSeverity = "new" }) => {

    return (
        <div className="relative">

            <Card
                background
                border
                className="text-left"

                end={<BuildCardEnd chunk={chunk} end={end} starred={!!chunk?.user_starred} />}
                desc={
                    <div className="relative">
                        {children}
                    </div>
                }
                linkProps={linkProps}
                size="medium"
                title={title}
                titleAs="h3"
            />
        </div>
    );
};

export const RenderPdfTextCard: React.FC<{ searchWords: string[]; chunk: ChunkWithScore<"pdf_text"> }> = ({ searchWords, chunk }) => {
    const path = chunk.title.toLowerCase().split('>');

    return (
        <BaseCard

            chunk={chunk}
            title={`${chunk.document.mediaName} - page ${chunk.metadata.pageNumber}`}
            linkProps={{
                href: `/pdf/${chunk.document.id}/${chunk.metadata.pageNumber}`,
                target: "_blank",
            }}
            end={<BreadcrumbNoLink className="flex pointer-events-none m-0" list={path} />}
        >

            <Highlighter
                highlightClassName="highlightSearch"
                searchWords={searchWords}
                autoEscape={false}
                textToHighlight={chunk.text}
                findChunks={findNormalizedChunks}
            />
        </BaseCard>
    )
};


export const RenderPdfImageCard: React.FC<{ chunk: ChunkWithScore<"pdf_image"> }> = ({ chunk }) => {
    const path = chunk.document.originalPath.split('ftp-data')[1]?.split('/') || chunk.document.originalPath.split('/')
    if (chunk.title) {
        path.push(...chunk.title.toLowerCase().split('>'))
    }
    return (
        <StyledImageCard
            background
            border
            imageAlt={chunk.text}
            imageUrl={`${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3ObjectName}`}
            end={<BuildCardEnd
                chunk={chunk}
                end={
                    <div className="flex">
                        <a className="m-0" href={`/pdf/${chunk.document.id}/${chunk.metadata.pageNumber}`} target="_blank">source</a>
                    </div>
                }
                starred={!!chunk?.user_starred}
                downloadLink={`${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3ObjectName}`}
            />}
            size="medium"
            title=""
            titleAs="h3"
        />

    )
};

export const RenderGroupedVideoTranscriptCard: React.FC<{ video: GroupedVideo; searchWords: string[] }> = ({ video, searchWords }) => {
    const firstChunk = video.items[0];
    const url = `${NEXT_PUBLIC_SERVER_URL}/s3/${firstChunk.document.s3ObjectName}`
    let originalPath = firstChunk.document.originalPath;
    const [selectedChunk, setSelectedChunk] = useState<ChunkWithScore<"video_transcript"> | undefined>(undefined)
    if (originalPath.includes("youtube") && selectedChunk) {
        originalPath = originalPath.replace("https://www.youtube.com/watch?v=", "https://youtu.be/") + `?t=${Math.floor(selectedChunk.metadata.start)}`
    }

    return (
        <StyledGroupedVideoCard
            end={<BuildCardEnd
                chunk={selectedChunk || video.items[0]}
                end={
                    <div className="flex flex-col items-start justify-between gap-4 overflow-hidden">
                        <a className="m-0 text-base overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full" href={`${originalPath}`} target="_blank">{firstChunk.title}</a>
                        <p className="m-0 text-xs text-[#666]">{video.items.length} correspondance{video.items.length > 1 ? 's' : ''}</p>
                    </div>
                }
                starred={selectedChunk ? selectedChunk.user_starred : undefined}
                downloadLink={`${NEXT_PUBLIC_SERVER_URL}/s3/${firstChunk.document.s3ObjectName}`}
            />}
            desc={
                <VideoPlayerHotSpots
                    videoUrl={url}
                    selectedChunk={selectedChunk}
                    onChunkSelected={(_chunk) => setSelectedChunk(_chunk)}
                    chunks={video.items}
                />
            }
            size="medium"
            title=""
        />
    )
}
export const RenderVideoTranscriptCard: React.FC<{ chunk: ChunkWithScore<"video_transcript">; searchWords: string[] }> = ({ chunk, searchWords }) => {
    let originalPath = chunk.document.originalPath;
    const url = `${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.document.s3ObjectName}`
    if (originalPath.includes("youtube")) {
        originalPath = originalPath.replace("https://www.youtube.com/watch?v=", "https://youtu.be/") + `?t=${Math.floor(chunk.metadata.start)}`
    }
    return (
        <StyledGroupedVideoCard
            end={<BuildCardEnd
                chunk={chunk}
                end={
                    <div className="flex flex-col items-start justify-between gap-4 overflow-hidden">
                        <a className="m-0 text-base overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full" href={`${originalPath}`} target="_blank">{chunk.title}</a>
                        {/* <p className="m-0 text-xs text-[#666]">{video.items.length} correspondance{video.items.length > 1 ? 's' : ''}</p> */}
                    </div>
                }
                starred={chunk.user_starred}
                downloadLink={`${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.document.s3ObjectName}`}
            />}
            desc={
                <VideoPlayerHotSpots
                    videoUrl={url}
                    selectedChunk={chunk}
                    onChunkSelected={() => {}}
                    chunks={[chunk]}
                />
            }
            size="medium"
            title=""
        />

        // <VideoPlayerHotSpots
        //     // <VideoPlayer
        //     selectedChunk={chunk}
        //     onChunkSelected={() => {}}
        //     videoUrl={`${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.document.s3ObjectName}`}
        //     chunks={[chunk]}
        // />
    )
};


function getDomain(input: string) {
    try {
        const url = new URL(input);
        return url.hostname;
    } catch (error) {
        const match = input.match(/^(?:https?:\/\/)?(?:[^@\n]+@)?(?:www\.)?([^:\/\n?]+)/im);
        return match ? match[1] : null;
    }
}


export const RenderWebsiteQAChunk: React.FC<{ chunk: ChunkWithScore<"website_qa">; searchWords: string[] }> = ({ chunk, searchWords }) => {
    const [expanded, setExpanded] = useState(false);
    const answerParts = chunk.metadata.answer.split("\n");

    return (
        <BaseCard

            chunk={chunk}
            title={chunk.title}
            linkProps={{
                href: chunk.document.originalPath,
                target: "_blank",
            }}
            badgeText="Question Réponse"
        >
            <div className="flex flex-col gap-4">
                <Typography className="text-md w-full mb-0">
                    <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={searchWords}
                        autoEscape={false}
                        textToHighlight={chunk.metadata.question}
                        findChunks={findNormalizedChunks}
                    />
                </Typography>
                <Button className="self-center" priority="secondary" onClick={() => setExpanded(!expanded)}>
                    {expanded ? 'Masquer les réponses' : 'Afficher les réponses'}
                </Button>
                <Collapse in={expanded}>
                    {answerParts.map((answer, index) => (
                        <div key={index} className={"text-left px-4 my-4"}>
                            {answer.startsWith('```') && answer.endsWith('```') ?
                                (
                                    <Quote
                                        className="overflow-hidden"
                                        // author="Auteur"
                                        source={answerParts[index + 1].startsWith('http') ? <a className="w-fit text-ellipsis" href={answerParts[index + 1]} target="_blank">{getDomain(answerParts[index + 1])}</a> : undefined}
                                        size="medium"
                                        text={
                                            <Highlighter
                                                highlightClassName="highlightSearch"
                                                searchWords={searchWords}
                                                autoEscape={false}
                                                textToHighlight={answer.startsWith('```') ? answer.slice(3, -3) : answer}
                                                findChunks={findNormalizedChunks}
                                            />

                                        }
                                    />
                                )
                                :
                                (
                                    (index > 1 && answerParts[index].startsWith('http') && answerParts[index - 1].startsWith('```')) ?
                                        <></>
                                        :
                                        <Highlighter
                                            highlightClassName="highlightSearch"
                                            searchWords={searchWords}
                                            autoEscape={false}
                                            textToHighlight={answer.startsWith('```') ? answer.slice(3, -3) : answer}
                                            findChunks={findNormalizedChunks}
                                        />
                                )
                            }
                        </div>
                        // <div key={index} className={answer.startsWith('```') && answer.endsWith('```') ? "bg-gray-300 rounded-xl my-4 p-4 text-left" : "text-left px-4"}>
                        //     <Highlighter
                        //         highlightClassName="highlightSearch"
                        //         searchWords={searchWords}
                        //         autoEscape={false}
                        //         textToHighlight={answer.startsWith('```') ? answer.slice(3, -3) : answer}
                        //         findChunks={findNormalizedChunks}
                        //     />
                        // </div>
                    ))}
                </Collapse>
            </div>
        </BaseCard>
    );
};

export const RenderWebsiteExperienceChunk: React.FC<{ chunk: ChunkWithScore<"website_experience">; searchWords: string[] }> = ({ chunk, searchWords }) => (
    <BaseCard

        chunk={chunk}
        title={chunk.title}
        linkProps={{
            href: chunk.document.originalPath,
            target: "_blank",
        }}
        badgeText={`Web/${chunk.metadata.type}`}
    >
        <div className="flex flex-col gap-4">
            {chunk.metadata.description.split('\n').map((paragraph, index) => (
                <Typography key={index} className="text-md w-full mb-0 text-left">
                    <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={searchWords}
                        autoEscape={false}
                        textToHighlight={paragraph}
                        findChunks={findNormalizedChunks}
                    />
                </Typography>
            ))}
        </div>
    </BaseCard>
);

export const ChunkRenderer: React.FC<ChunkRendererProps> = ({ chunk, searchWords }) => {
    if (isPdfImageChunk(chunk)) return <RenderPdfImageCard chunk={chunk} />;
    if (isPdfTextChunk(chunk)) return <RenderPdfTextCard chunk={chunk} searchWords={searchWords} />;
    if (isVideoTranscriptChunk(chunk)) return <RenderVideoTranscriptCard chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteQAChunk(chunk)) return <RenderWebsiteQAChunk chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteExperienceChunk(chunk)) return <RenderWebsiteExperienceChunk chunk={chunk} searchWords={searchWords} />;
    return null;
};

export default ChunkRenderer;