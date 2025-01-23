"use client";

import { StyledCardWithoutTitle, StyledGroupedVideoCard } from "@/app/recherche/DocumentChunkFull";
import { h5pIdToPublicUrl } from "@/types/vectordb";
import Card from "@codegouvfr/react-dsfr/Card";
import styled from "@emotion/styled";
import { H5PContent, Document } from "@prisma/client";

const StyledCard = styled(Card)`
.fr-card__content {
    padding: 0 !important;
}

.fr-card__desc,
.fr-card__start {
    margin: 0 !important;
}

.fr-card__title {
    display: none;
}
.fr-card__end {
    padding: 1rem;
    margin: 0 !important;
}

`
function H5PContentCard({ content, h5pPublicUrl }: { h5pPublicUrl: string, content: H5PContent & { documents: Document[] } }) {
    return (
        <StyledCard
            background
            border
            className="text-left w-full"
            desc={
                <div className="relative">
                    <iframe className="w-full aspect-[16/11.5]" src={h5pPublicUrl} />
                </div>
            }
            end={
                content.documents.map(d => (
                    <p key={d.mediaName} className="m-0 text-base overflow-hidden whitespace-nowrap overflow-ellipsis max-w-full block">{d.mediaName}</p>
                ))
            }
            size="medium"
            title={""}
            titleAs="h3"
        />
    );
}

export default H5PContentCard;