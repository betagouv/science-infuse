import React, { useState } from "react";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { ChunkWithScore, ChunkWithScoreUnion, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, isWebsiteQAChunk } from "@/types";
import { findNormalizedChunks } from "../text-highlighter";
import Highlighter from "react-highlight-words";
import { NEXT_PUBLIC_FILE_SERVER_URL } from "@/config";
import VideoPlayer from "@/app/mediaViewers/VideoPlayer";
import { Typography } from "@mui/material";
import { Collapse } from '@mui/material';
import Badge from "@codegouvfr/react-dsfr/Badge";
import Button from "@codegouvfr/react-dsfr/Button";

const RenderPdfTextCard = (props: {
    searchWords: string[];
    chunk: ChunkWithScore<"pdf_text">;
}) => {
    return (
        <Card
            background
            border
            desc={
                <Highlighter
                    highlightClassName="highlightSearch"
                    searchWords={props.searchWords}
                    autoEscape={false}
                    textToHighlight={props.chunk.text}
                    findChunks={findNormalizedChunks}
                />
            }
            footer={
                <ul className="fr-btns-group fr-btns-group--inline-reverse fr-btns-group--inline-lg">
                    <li>
                        <button className="fr-btn fr-btn--secondary">
                            <a
                                target="_blank"
                                href={`${NEXT_PUBLIC_FILE_SERVER_URL}${props.chunk.document.public_path}#page=${props.chunk.metadata.page_number}`}
                            >
                                source
                            </a>
                        </button>
                    </li>
                </ul>
            }
            size="small"
            title=""
            titleAs="h3"
        />
    );
};

const RenderPdfImageCard = (props: { chunk: ChunkWithScore<"pdf_image"> }) => {
    return (
        <Card
            background
            border
            desc={
                <img
                    className="w-full"
                    src={`${NEXT_PUBLIC_FILE_SERVER_URL}${props.chunk.metadata.public_path}`}
                />
            }
            enlargeLink
            linkProps={{
                href: `${NEXT_PUBLIC_FILE_SERVER_URL}${props.chunk.metadata.public_path}`,
                target: "_blank",
            }}
            size="medium"
            title={props.chunk.media_type}
            titleAs="h3"
        />
    );
};

export const RenderVideoTranscriptCard = (props: {
    chunk: ChunkWithScore<"video_transcript">;
    searchWords: string[];
}) => {
    console.log("colibri", props.chunk);
    return (
        <Card
            background
            border
            desc={
                <div>
                    <VideoPlayer
                        videoUrl={`${NEXT_PUBLIC_FILE_SERVER_URL}${props.chunk.document.public_path}`}
                        startOffset={props.chunk.metadata.start}
                        endOffset={props.chunk.metadata.end}
                    />
                    <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={props.searchWords}
                        autoEscape={false}
                        textToHighlight={props.chunk.text}
                        findChunks={findNormalizedChunks}
                    />
                </div>
            }
            linkProps={{
                href: `${props.chunk.document.original_public_path}`,
                target: "_blank",
            }}
            size="medium"
            title={props.chunk.title}
            titleAs="h3"
        />
    );
};

export const RenderWebsiteQAChunk = (props: { chunk: ChunkWithScore<"website_qa">; searchWords: string[]; }) => {
    const answerParts = props.chunk.metadata.answer.split("\n")
    const [expanded, setExpanded] = useState(false);

    return (
        <Card
            background
            start={<ul className="fr-badges-group"><li><Badge severity="new">Question Réponse</Badge></li></ul>}
            border
            desc={
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col">
                        <Typography className="text-md w-full mb-0">
                            <Highlighter
                                highlightClassName="highlightSearch"
                                searchWords={props.searchWords}
                                autoEscape={false}
                                textToHighlight={props.chunk.metadata.question}
                                findChunks={findNormalizedChunks}
                            />
                        </Typography>
                    </div>
                    <Button className="self-center" priority="secondary" onClick={() => setExpanded(!expanded)}>
                        {expanded ? 'Masquer les réponses' : 'Afficher les réponses'}
                    </Button>
                    <div className="flex flex-col gap-4">
                        <Collapse in={expanded}>
                            {answerParts.map(answer => {
                                return answer.startsWith('```') && answer.endsWith('```') ?

                                    <div key={answer} className="bg-gray-50 p-4 text-left">
                                        {/* <LinkParser> */}
                                        <Highlighter
                                            highlightClassName="highlightSearch"
                                            searchWords={props.searchWords}
                                            autoEscape={false}
                                            textToHighlight={answer.slice(3, -3)}
                                            findChunks={findNormalizedChunks}
                                        />
                                        {/* </LinkParser> */}
                                    </div>
                                    :
                                    <div key={answer} className="text-left px-4">
                                        {/* <LinkParser> */}
                                        <Highlighter
                                            highlightClassName="highlightSearch"
                                            searchWords={props.searchWords}
                                            autoEscape={false}
                                            textToHighlight={answer}
                                            findChunks={findNormalizedChunks}
                                        />
                                        {/* </LinkParser> */}
                                    </div>
                            })}
                        </Collapse>
                    </div>
                    {/* <Quote
                        text={'test'}
                    /> */}
                    {/* <Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={props.searchWords}
                        autoEscape={false}
                        textToHighlight={props.chunk.metadata.question}
                        findChunks={findNormalizedChunks}
                    /> */}
                </div>
            }
            linkProps={{
                href: `${props.chunk.document.original_public_path}`,
                target: "_blank",
            }}
            size="medium"
            title={props.chunk.title}
            titleAs="h3"
        />
    );
};

export default (props: {
    chunk: ChunkWithScoreUnion;
    searchWords: string[];
}) => {
    return (
        <div>
            {isPdfImageChunk(props.chunk) && (
                <RenderPdfImageCard chunk={props.chunk} />
            )}
            {isPdfTextChunk(props.chunk) && (
                <RenderPdfTextCard
                    chunk={props.chunk}
                    searchWords={props.searchWords}
                />
            )}
            {isVideoTranscriptChunk(props.chunk) && (
                <RenderVideoTranscriptCard
                    chunk={props.chunk}
                    searchWords={props.searchWords}
                />
            )}
            {isWebsiteQAChunk(props.chunk) && (
                <RenderWebsiteQAChunk
                    chunk={props.chunk}
                    searchWords={props.searchWords}
                />
            )}
        </div>
    );
};
