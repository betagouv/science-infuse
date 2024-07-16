import React, { useState } from "react";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { ChunkWithScore, ChunkWithScoreUnion, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, isWebsiteExperienceChunk, isWebsiteQAChunk } from "@/types";
import { findNormalizedChunks } from "../text-highlighter";
import Highlighter from "react-highlight-words";
import { NEXT_PUBLIC_FILE_SERVER_URL, NEXT_PUBLIC_SERVER_URL } from "@/config";
import VideoPlayer from "@/app/mediaViewers/VideoPlayer";
import { Typography, Collapse } from '@mui/material';
import Badge from "@codegouvfr/react-dsfr/Badge";
// import Button from "@codegouvfr/react-dsfr/Button";
import { fr } from "@codegouvfr/react-dsfr";
import { Button } from "@codegouvfr/react-dsfr/Button";
// Types
type UserApprovalButtonsProps = {
    onApprove: () => void;
    onDisapprove: () => void;
};

type BaseCardProps = {
    children: React.ReactNode;
    title: string;
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

// New component for user approval
export const UserApprovalButtons: React.FC<UserApprovalButtonsProps> = ({ onApprove, onDisapprove }) => (
    <div className="absolute bottom-2 right-2 flex gap-2">


        <Button
            onClick={onDisapprove}
            iconId="ri-thumb-up-fill"
            title="Disapprove"
            priority="tertiary no outline"
            className="text-green-500 hover:text-green-700"
        />
        <Button
            onClick={onDisapprove}
            iconId="ri-thumb-down-fill"
            title="Disapprove"
            priority="tertiary no outline"
            className="text-red-500 hover:text-red-700"
        />
    </div>
);

// Base Card component
export const BaseCard: React.FC<BaseCardProps> = ({ children, title, linkProps, badgeText, badgeSeverity = "new" }) => {
    const [isApproved, setIsApproved] = useState<boolean | null>(null);

    const handleApprove = () => setIsApproved(true);
    const handleDisapprove = () => setIsApproved(false);

    return (
        <div className="relative">

            <Card
                background
                border
                start={badgeText && (
                    <ul className="fr-badges-group">
                        <li><Badge severity={badgeSeverity}>{badgeText}</Badge></li>
                    </ul>
                )}
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
            <UserApprovalButtons onApprove={handleApprove} onDisapprove={handleDisapprove} />
        </div>
    );
};

export const RenderPdfTextCard: React.FC<{ searchWords: string[]; chunk: ChunkWithScore<"pdf_text"> }> = ({ searchWords, chunk }) => (
    <BaseCard
        title={`${chunk.document.media_name} - page ${chunk.metadata.page_number}`}
        linkProps={{
            href: `/pdf/${encodeURIComponent((chunk.document.s3_object_name))}/${chunk.metadata.page_number}`,
            target: "_blank",
        }}
    >
        <Highlighter
            highlightClassName="highlightSearch"
            searchWords={searchWords}
            autoEscape={false}
            textToHighlight={chunk.text}
            findChunks={findNormalizedChunks}
        />
    </BaseCard>
);

export const RenderPdfImageCard: React.FC<{ chunk: ChunkWithScore<"pdf_image"> }> = ({ chunk }) => (
    <BaseCard
        title={`${chunk.document.media_name} - page ${chunk.metadata.page_number}`}
        linkProps={{
            href: `/pdf/${encodeURIComponent((chunk.document.s3_object_name))}/${chunk.metadata.page_number}`,
            target: "_blank",
        }}
    // linkProps={{
    //     href: `${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3_object_name}`,
    //     target: "_blank",
    // }}
    >
        <img
            className="w-full"
            src={`${NEXT_PUBLIC_SERVER_URL}/s3/${chunk.metadata.s3_object_name}`}
            alt={chunk.media_type}
        />
    </BaseCard>
);

export const RenderVideoTranscriptCard: React.FC<{ chunk: ChunkWithScore<"video_transcript">; searchWords: string[] }> = ({ chunk, searchWords }) => (
    <BaseCard
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
            <Highlighter
                highlightClassName="highlightSearch"
                searchWords={searchWords}
                autoEscape={false}
                textToHighlight={chunk.text}
                findChunks={findNormalizedChunks}
            />
        </div>
    </BaseCard>
);

export const RenderWebsiteQAChunk: React.FC<{ chunk: ChunkWithScore<"website_qa">; searchWords: string[] }> = ({ chunk, searchWords }) => {
    const [expanded, setExpanded] = useState(false);
    const answerParts = chunk.metadata.answer.split("\n");

    return (
        <BaseCard
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

export const RenderWebsiteExperienceChunk: React.FC<{ chunk: ChunkWithScore<"website_experience">; searchWords: string[] }> = ({ chunk, searchWords }) => (
    <BaseCard
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

const ChunkRenderer: React.FC<ChunkRendererProps> = ({ chunk, searchWords }) => {
    if (isPdfImageChunk(chunk)) return <RenderPdfImageCard chunk={chunk} />;
    if (isPdfTextChunk(chunk)) return <RenderPdfTextCard chunk={chunk} searchWords={searchWords} />;
    if (isVideoTranscriptChunk(chunk)) return <RenderVideoTranscriptCard chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteQAChunk(chunk)) return <RenderWebsiteQAChunk chunk={chunk} searchWords={searchWords} />;
    if (isWebsiteExperienceChunk(chunk)) return <RenderWebsiteExperienceChunk chunk={chunk} searchWords={searchWords} />;
    return null;
};

export default ChunkRenderer;