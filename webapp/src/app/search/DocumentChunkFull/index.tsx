import React, { useState } from "react";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { ChunkWithScore, ChunkWithScoreUnion, isPdfImageChunk, isPdfTextChunk, isVideoTranscriptChunk } from "@/types";
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

const RenderPdfImageCard = (chunk: ChunkWithScore<"pdf_image" | "raw_image">) => {
    return <Card
        background
        border
        desc={<img className="w-full" src={`${MEDIA_BASE_URL}${chunk.metadata.public_path}`} />}
        // desc="Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et"
        enlargeLink
        // imageAlt="texte alternatif de l’image"
        // imageUrl="https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png"
        linkProps={{
            href: `${MEDIA_BASE_URL}${chunk.metadata.public_path}`,
            target: "_blank"
        }}
        size="medium"
        title={chunk.media_type}
        titleAs="h3"
    />
}

const RenderVideoTranscriptCard = (props: {chunk: ChunkWithScore<"video_transcript">, searchWords: string[]}) => {
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
    const [expanded, setExpanded] = useState(false)
    const _score = (Number((props.chunk.score)) * 100).toFixed();
    return (
        <div>
            <Tag small className=" h-fit" >{_score}%</Tag>

            {isPdfImageChunk(props.chunk) && <RenderPdfImageCard {...props.chunk} />}
            {isPdfTextChunk(props.chunk) && <RenderPdfTextCard chunk={props.chunk} searchWords={props.searchWords} />}
            {isVideoTranscriptChunk(props.chunk) && <RenderVideoTranscriptCard chunk={props.chunk} searchWords={props.searchWords}/>}
            {/* <Typography>Score: {props.chunk.score}</Typography> */}
        </div>
    );
};