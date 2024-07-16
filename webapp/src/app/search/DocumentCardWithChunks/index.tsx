import React, { useState } from "react";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Typography } from "@mui/material";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Highlighter from "react-highlight-words";
import { ChunkWithScoreUnion, DocumentSearchResult, isPdfImageChunk, isTextChunk, isVideoTranscriptChunk, PdfImageChunk } from "@/types";
import { Quote } from "@codegouvfr/react-dsfr/Quote";
import { findNormalizedChunks } from "../text-highlighter";
import { NEXT_PUBLIC_FILE_SERVER_URL } from "@/config";
import ChunkRenderer, { RenderVideoTranscriptCard } from "../DocumentChunkFull";

const RenderChunkPreview = (props: { chunk: ChunkWithScoreUnion, searchWords: string[] }) => {
    const [expanded, setExpanded] = useState(false)
    const _score = (Number((props.chunk.score)) * 100).toFixed();
    console.log("${NEXT_PUBLIC_FILE_SERVER_URL}", NEXT_PUBLIC_FILE_SERVER_URL)
    return (
        <Accordion
            label={<div className="flex max-w-full gap-2 justiy-center items-center whitespace-nowrap overflow-ellipsis">
                <Tag small className=" h-fit" >{_score}%</Tag>
                <p className="overflow-ellipsis max-w-full overflow-hidden">{props.chunk.text}</p>
            </div>}
            onExpandedChange={(value,) => setExpanded(!value)}
            expanded={expanded}
        >
            <ChunkRenderer chunk={props.chunk} searchWords={props.searchWords} />
            <Typography>Score: {props.chunk.score}</Typography>
        </Accordion>
    );
};

export default (props: { searchResult: DocumentSearchResult, searchWords: string[] }) => {
    const { searchResult, searchWords } = props;
    return <div
        className="flex-auto sm:flex-auto md:flex-auto sm:w-[calc(100%)] md:w-[calc(50%-1rem)]"
    >
        <Card
            className="grid-item flex flex-col items-center justify-center w-full h-full"
            title={<a target="_blank" href={`${NEXT_PUBLIC_FILE_SERVER_URL}${searchResult.public_path}`}>
                <Highlighter
                    highlightClassName="highlightSearch"
                    searchWords={searchWords}
                    autoEscape={true}
                    textToHighlight={searchResult.media_name}
                />
            </a>
            }
            titleAs="h3"
            desc={<>
                {searchResult.chunks.sort((a, b) => b.score - a.score).map(chunk => <RenderChunkPreview key={chunk.text} chunk={chunk} searchWords={searchWords} />)}
            </>}
            footer={
                <button className="fr-btn fr-btn--secondary">Rechercher dans ce document</button>
            }
            background
            border
            // enlargeLink
            imageComponent={null}
            // imageAlt="texte alternatif de l'image"
            // imageUrl="https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png"
            linkProps={{
                href: "#",
            }}
            size="medium"
            start={
                <ul className="fr-badges-group">
                    <li>
                        {searchResult.max_score == 1 ? <Badge small severity="success">Exact match</Badge> : <Badge small>Max score: {(Number((searchResult.max_score)) * 100).toFixed()}%</Badge>}
                    </li>
                    {/* display chunk types list */}
                    <li>
                        {Array.from(new Set(searchResult.chunks.map((chunk) => chunk.media_type))).map(type =>
                            <Badge key={type} small>
                                {type}
                            </Badge>
                        )}

                    </li>
                </ul>
            }
        />
    </div>

}
