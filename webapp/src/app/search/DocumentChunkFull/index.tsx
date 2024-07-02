import React, { useState } from "react";
import { Card } from "@codegouvfr/react-dsfr/Card";
import { Badge } from "@codegouvfr/react-dsfr/Badge";
import { Typography } from "@mui/material";
import { Accordion } from "@codegouvfr/react-dsfr/Accordion";
import Highlighter from "react-highlight-words";
import { ChunkWithScore, ChunkWithScoreUnion, DocumentSearchResult, isImageChunk, isTextChunk } from "@/types";
import { Quote } from "@codegouvfr/react-dsfr/Quote";
import { findNormalizedChunks } from "../text-highlighter";
import { Tile } from "@codegouvfr/react-dsfr/Tile";
import { Tag } from "@codegouvfr/react-dsfr/Tag";


const RenderTextCard = (chunk: ChunkWithScore<"text">) => {
    return <Card
        background
        border
        desc={chunk.text}
        size="small"
        title=""
        titleAs="h3"
    />
}

const RenderImageCard = (chunk: ChunkWithScore<"image">) => {
    return  <Card
    background
    border
    desc={<img className="w-full" src={`http://localhost:8001${chunk.metadata.public_path}`}/>}
    // desc="Lorem ipsum dolor sit amet, consectetur adipiscing, incididunt, ut labore et dolore magna aliqua. Vitae sapien pellentesque habitant morbi tristique senectus et"
    enlargeLink
    // imageAlt="texte alternatif de l’image"
    // imageUrl="https://www.systeme-de-design.gouv.fr/img/placeholder.16x9.png"
    linkProps={{
      href: `http://localhost:8001${chunk.metadata.public_path}`,
      target:"_blank"
    }}
    size="medium"
    title={chunk.media_type}
    titleAs="h3"
  />
}
export default (props: { chunk: ChunkWithScoreUnion, searchWords: string[] }) => {
    const [expanded, setExpanded] = useState(false)
    const _score = (Number((props.chunk.score)) * 100).toFixed();
    return (
        <div>
            <Tag small className=" h-fit" >{_score}%</Tag>

            {isImageChunk(props.chunk) && <RenderImageCard {...props.chunk} />}
            {isTextChunk(props.chunk) && <RenderTextCard {...props.chunk} />}
            {/* <Typography>Score: {props.chunk.score}</Typography> */}
        </div>
    );
};