import React, { useState } from "react";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { Typography } from "@mui/material";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Highlighter from "react-highlight-words";
import { ChunkWithScoreUnion, DocumentSearchResult, isPdfImageChunk, isTextChunk } from "@/types";
import { Quote } from "@codegouvfr/react-dsfr/Quote";
import { findNormalizedChunks } from "../text-highlighter";
import { MEDIA_BASE_URL } from "@/config";

const RenderChunkPreview = (props: { chunk: ChunkWithScoreUnion, searchWords: string[]}) => {
    const [expanded, setExpanded] = useState(false)
    const _score = (Number((props.chunk.score)) * 100).toFixed();
    console.log("${MEDIA_BASE_URL}", MEDIA_BASE_URL)
    return (
        <Accordion
            label={<div className="flex max-w-full gap-2 justiy-center items-center whitespace-nowrap overflow-ellipsis">
                <Tag small className=" h-fit" >{_score}%</Tag>
                <p className="overflow-ellipsis max-w-full overflow-hidden">{props.chunk.text}</p>
            </div>}
            onExpandedChange={(value,) => setExpanded(!value)}
            expanded={expanded}
        >
            <Typography>Passage: </Typography>
            {isPdfImageChunk(props.chunk) && <>
                <img src={`${MEDIA_BASE_URL}${props.chunk.metadata.public_path}`} className="max-w-full max-h-48" />
            </>}
            {isTextChunk(props.chunk) && <>
                <Quote
                    author="Auteur"
                    source={<><li><cite>Ouvrage</cite></li><li>Détail 1</li><li>Détail 2</li><li>Détail 3</li><li><a href="[À MODIFIER | Lien vers la sources ou des infos complémentaires]" target="_blank">Détail 4</a></li></>}
                    text={<Highlighter
                        highlightClassName="highlightSearch"
                        searchWords={props.searchWords}
                        autoEscape={false}
                        textToHighlight={props.chunk.text}
                        findChunks={findNormalizedChunks}
                    />}
                />
            </>}
            <Typography>Media Type: {props.chunk.media_type}</Typography>
            <Typography>Metadatas {JSON.stringify(props.chunk.metadata)}</Typography>
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
            title={<a target="_blank" href={`${MEDIA_BASE_URL}${searchResult.public_path}`}>
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
                {searchResult.chunks.sort((a, b) => b.score - a.score).map(chunk => <RenderChunkPreview chunk={chunk} searchWords={searchWords} />)}
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
                            <Badge small>
                                {type}
                            </Badge>
                        )}

                    </li>
                </ul>
            }
        />
    </div>

}
