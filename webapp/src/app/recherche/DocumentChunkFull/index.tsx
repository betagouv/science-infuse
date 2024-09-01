import React, { useState } from "react";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { ChunkWithScore, ChunkWithScoreUnion, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, isWebsiteExperienceChunk, isWebsiteQAChunk } from "@/types/vectordb";
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

// Types
type UserApprovalButtonsProps = {
    onApprove: () => void;
    onDisapprove: () => void;
    userApproved: boolean;
    userDisapproved: boolean;
};

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
    groupedInDocument?: boolean;
    badgeSeverity?: "new" | "info" | "success" | "warning" | "error";
};

type ChunkRendererProps = {
    chunk: ChunkWithScoreUnion;
    groupedInDocument?: boolean;
    searchWords: string[];
};

// New component for user approval
export const UserApprovalButtons: React.FC<UserApprovalButtonsProps> = ({ userApproved, userDisapproved, onApprove, onDisapprove }) => {
    console.log("UserApprovalButtons", userApproved, userDisapproved)
    return (
        <div className="absolute bottom-2 right-2 flex gap-2">
            <Button
                style={{ color: userApproved ? "green" : "gray" }}
                onClick={onApprove}
                iconId="ri-thumb-up-fill"
                title="Disapprove"
                priority="tertiary no outline"
            />
            <Button
                style={{ color: userDisapproved ? "red" : "gray" }}
                onClick={onDisapprove}
                iconId="ri-thumb-down-fill"
                title="Disapprove"
                priority="tertiary no outline"
            />
        </div>
    );
}

export const getColorFromScore = (score: number) => {
    const clampedScore = Math.max(0, Math.min(1, score));
    const hue = clampedScore * 120;
    return `hsl(${hue}, 100%, 50%)`;
}

const Star = (props: { starred: boolean }) => {
    return <Tooltip title={props.starred ? "Supprimer des favoris" : "Ajouter aux favoris"}>
        {props.starred ? <svg className="cursor-pointer" width="24" height="23" viewBox="0 0 24 23" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9999 18.26L4.94691 22.208L6.52191 14.28L0.586914 8.792L8.61391 7.84L11.9999 0.5L15.3859 7.84L23.4129 8.792L17.4779 14.28L19.0529 22.208L11.9999 18.26Z" fill="#161616" />
        </svg> : <svg className="cursor-pointer" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M11.9999 0.5L15.3859 7.84L23.4129 8.792L17.4779 14.28L19.0529 22.208L11.9999 18.26L4.94691 22.208L6.52191 14.28L0.586914 8.792L8.61391 7.84L11.9999 0.5ZM11.9999 5.275L9.96191 9.695L5.12891 10.267L8.70191 13.572L7.75291 18.345L11.9999 15.968L16.2469 18.345L15.2979 13.572L18.8709 10.267L14.0379 9.694L11.9999 5.275Z" fill="#161616" />
        </svg>}
    </Tooltip>
}

const BuildCardEnd = (props: { end?: React.ReactNode, downloadLink?: string, starred: boolean }) => {
    return (
        <div className="flex flex-row justify-between gap-4">
            {props.end}
            <div className="flex self-end gap-4 ml-auto">
                <Star starred={props.starred} />
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
    const [isApproved, setIsApproved] = useState<boolean>(!!chunk.user_approved);
    const [isDisApproved, setIsDisApproved] = useState<boolean>(!!chunk.user_disapproved);

    const handleApprove = async () => {
        await axios.post(
            `${NEXT_PUBLIC_SERVER_URL}/approve/document_chunk`,
            {
                approve: true,
                uuid: chunk.id,
            }
        );
        setIsApproved(true)
        setIsDisApproved(false)
    };
    const handleDisapprove = async () => {
        await axios.post(
            `${NEXT_PUBLIC_SERVER_URL}/approve/document_chunk`,
            {
                approve: false,
                uuid: chunk.id,
            }
        );
        setIsApproved(false)
        setIsDisApproved(true)
    };

    return (
        <div className="relative">

            <Card
                background
                border
                className="text-left"
                // endDetail={"test"}
                // start={
                //     <ul className="fr-badges-group">
                //         <li><Badge style={{ borderLeft: `4px solid ${getColorFromScore(chunk.score)}` }}>score: {(chunk.score * 100).toFixed(0)}%</Badge> </li>
                //         {badgeText && <li><Badge severity={badgeSeverity}>{badgeText}</Badge></li>}
                //     </ul>
                // }
                end={<BuildCardEnd end={end} starred={false} />}
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
            {/* <UserApprovalButtons userApproved={isApproved} userDisapproved={isDisApproved} onApprove={handleApprove} onDisapprove={handleDisapprove} /> */}
        </div>
    );
};

export const RenderPdfTextCard: React.FC<{ groupedInDocument?: boolean, searchWords: string[]; chunk: ChunkWithScore<"pdf_text"> }> = ({ searchWords, chunk, groupedInDocument }) => {
    const path = chunk.title.toLowerCase().split('>');
    // const path = chunk.document.original_path.split('ftp-data')[1]?.split('/') || chunk.document.original_path.split('/')
    // if (chunk.title) {
    //     path.push(...chunk.title.toLowerCase().split('>'))
    // }

    return (
        <BaseCard
            groupedInDocument={groupedInDocument}
            chunk={chunk}
            title={groupedInDocument ? `page ${chunk.metadata.page_number}` : `${chunk.document.media_name} - page ${chunk.metadata.page_number}`}
            linkProps={{
                href: `/pdf/${chunk.document.id}/${chunk.metadata.page_number}`,
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

const StyledImageCard = styled(Card)`
a {
    filter: none;
}
.fr-responsive-img {
    object-fit: contain;
    background-color: #f6f6f6;
}

.fr-card__content {
    padding: 1rem;
    padding-top: 0;
}

.fr-card__title {
    display: none;
}
`
export const RenderPdfImageCard: React.FC<{ groupedInDocument?: boolean, chunk: ChunkWithScore<"pdf_image"> }> = ({ chunk, groupedInDocument }) => {
    const path = chunk.document.original_path.split('ftp-data')[1]?.split('/') || chunk.document.original_path.split('/')
    if (chunk.title) {
        path.push(...chunk.title.toLowerCase().split('>'))
    }
    return (
        <StyledImageCard
            background
            border
            // desc="Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et"
            // enlargeLink
            imageAlt={chunk.text}
            imageUrl={`${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3_object_name}`}
            end={<BuildCardEnd
                end={
                    <div className="flex">
                        <a className="m-0" href={`/pdf/${chunk.document.id}/${chunk.metadata.page_number}`} target="_blank">source</a>
                    </div>
                }
                starred={false}
                downloadLink={`${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3_object_name}`}
            />}
            size="medium"
            title=""
            titleAs="h3"
        />

    )
};

export const RenderVideoTranscriptCard: React.FC<{ groupedInDocument?: boolean, chunk: ChunkWithScore<"video_transcript">; searchWords: string[] }> = ({ groupedInDocument, chunk, searchWords }) => {
    const { getCollapseProps, getToggleProps, isExpanded } = useCollapse()
    return (
        <BaseCard
            groupedInDocument={groupedInDocument}
            chunk={chunk}
            title={chunk.title}
            linkProps={{
                href: chunk.document.original_path,
                target: "_blank",
            }}
        >
            <div>
                <VideoPlayer
                    videoUrl={`${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.document.s3_object_name}`}
                    startOffset={chunk.metadata.start}
                    endOffset={chunk.metadata.end}
                />
                <div className="mt-4">
                    {chunk.text.length < 200 ? <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={searchWords}
                        autoEscape={false}
                        textToHighlight={chunk.text.slice(0, 100)}
                        findChunks={findNormalizedChunks}
                    />
                        : <>
                            <div className="absolute text-left">
                                <Highlighter
                                    highlightClassName="highlightSearch"
                                    searchWords={searchWords}
                                    autoEscape={false}
                                    textToHighlight={`${chunk.text.slice(0, 100)}...`}
                                    findChunks={findNormalizedChunks}
                                />
                            </div>
                            <div
                                className="text-left"
                                {...getCollapseProps({ style: { margin: 0 } })}
                            >
                                <Highlighter
                                    highlightClassName="highlightSearch"
                                    searchWords={searchWords}
                                    autoEscape={false}
                                    textToHighlight={chunk.text}
                                    findChunks={findNormalizedChunks}
                                />
                            </div>
                        </>
                    }

                </div>
                <Button
                    priority="secondary"
                    {...getToggleProps({ style: { display: 'block', marginTop: isExpanded ? '1rem' : '5rem' } })}
                >
                    {isExpanded ? 'Cliquer pour réduire' : 'Lire la suite ?'}
                </Button>

            </div>
        </BaseCard >
    )
};

export const RenderWebsiteQAChunk: React.FC<{ groupedInDocument?: boolean, chunk: ChunkWithScore<"website_qa">; searchWords: string[] }> = ({ groupedInDocument, chunk, searchWords }) => {
    const [expanded, setExpanded] = useState(false);
    const answerParts = chunk.metadata.answer.split("\n");

    return (
        <BaseCard
            groupedInDocument={groupedInDocument}
            chunk={chunk}
            title={chunk.title}
            linkProps={{
                href: chunk.document.original_path,
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
                        <div key={index} className={answer.startsWith('```') && answer.endsWith('```') ? "bg-gray-50 p-4 text-left" : "text-left px-4"}>
                            <Highlighter
                                highlightClassName="highlightSearch"
                                searchWords={searchWords}
                                autoEscape={false}
                                textToHighlight={answer.startsWith('```') ? answer.slice(3, -3) : answer}
                                findChunks={findNormalizedChunks}
                            />
                        </div>
                    ))}
                </Collapse>
            </div>
        </BaseCard>
    );
};

export const RenderWebsiteExperienceChunk: React.FC<{ groupedInDocument?: boolean, chunk: ChunkWithScore<"website_experience">; searchWords: string[] }> = ({ groupedInDocument, chunk, searchWords }) => (
    <BaseCard
        groupedInDocument={groupedInDocument}
        chunk={chunk}
        title={chunk.title}
        linkProps={{
            href: chunk.document.original_path,
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

const ChunkRenderer: React.FC<ChunkRendererProps> = ({ groupedInDocument, chunk, searchWords }) => {
    if (isPdfImageChunk(chunk)) return <RenderPdfImageCard groupedInDocument={groupedInDocument} chunk={chunk} />;
    if (isPdfTextChunk(chunk)) return <RenderPdfTextCard groupedInDocument={groupedInDocument} chunk={chunk} searchWords={searchWords} />;
    if (isVideoTranscriptChunk(chunk)) return <RenderVideoTranscriptCard groupedInDocument={groupedInDocument} chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteQAChunk(chunk)) return <RenderWebsiteQAChunk groupedInDocument={groupedInDocument} chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteExperienceChunk(chunk)) return <RenderWebsiteExperienceChunk groupedInDocument={groupedInDocument} chunk={chunk} searchWords={searchWords} />;
    return null;
};

export default ChunkRenderer;