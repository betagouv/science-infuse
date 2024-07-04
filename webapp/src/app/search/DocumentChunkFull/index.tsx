import React, { useState } from "react";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { ChunkWithScore, ChunkWithScoreUnion, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk, PdfImageChunk, VideoTranscriptChunk } from "@/types";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { findNormalizedChunks } from "../text-highlighter";
import Highlighter from "react-highlight-words";
import { MEDIA_BASE_URL } from "@/config";
import VideoPlayer from "@/app/mediaViewers/VideoPlayer";


const RenderPdfTextCard = (props: { searchWords: string[], chunk: ChunkWithScore<"pdf_text"> }) => {
    return <Card
        background
        border
        desc={<Highlighter
            highlightClassName="highlightSearch"
            searchWords={props.searchWords}
            autoEscape={false}
            textToHighlight={props.chunk.text}
            findChunks={findNormalizedChunks}
        />}
        footer={<ul className="fr-btns-group fr-btns-group--inline-reverse fr-btns-group--inline-lg">
            <li>
                <button className="fr-btn fr-btn--secondary" ><a target="_blank" href={`${MEDIA_BASE_URL}${props.chunk.document.public_path}#page=${props.chunk.metadata.page_number}`}>source</a></button>
            </li>
        </ul>}
        size="small"
        title=""
        titleAs="h3"
    />
}

const RenderPdfImageCard = (props: { chunk: ChunkWithScore<"pdf_image"> }) => {
    return <Card
        background
        border
        desc={<img className="w-full" src={`${MEDIA_BASE_URL}${props.chunk.metadata.public_path}`} />}
        enlargeLink
        linkProps={{
            href: `${MEDIA_BASE_URL}${props.chunk.metadata.public_path}`,
            target: "_blank"
        }}
        size="medium"
        title={props.chunk.media_type}
        titleAs="h3"
    />
}

export const RenderVideoTranscriptCard = (props: { chunk: ChunkWithScore<"video_transcript">, searchWords: string[] }) => {
    console.log("colibri", props.chunk)
    return <Card
        background
        border
        desc={
            <div>
                <VideoPlayer videoUrl={`${MEDIA_BASE_URL}${props.chunk.document.public_path}`} startOffset={props.chunk.metadata.start} endOffset={props.chunk.metadata.end} />
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
            target: "_blank"
        }}
        size="medium"
        title={props.chunk.media_type}
        titleAs="h3"
    />
}

export default (props: { chunk: ChunkWithScoreUnion, searchWords: string[] }) => {
    return (
        <div>
            {isPdfImageChunk(props.chunk) && <RenderPdfImageCard chunk={props.chunk} />}
            {isPdfTextChunk(props.chunk) && <RenderPdfTextCard chunk={props.chunk} searchWords={props.searchWords} />}
            {isVideoTranscriptChunk(props.chunk) && <RenderVideoTranscriptCard chunk={props.chunk} searchWords={props.searchWords} />}
        </div>
    );
};