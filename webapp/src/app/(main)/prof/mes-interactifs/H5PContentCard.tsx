"use client";

import { DocumentPreview } from "@/app/(main)/recherche/DocumentChunkFull";
import { DocumentWithChunks } from "@/types/vectordb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import styled from "@emotion/styled";
import { H5PContent } from "@prisma/client";
import { Download } from "@codegouvfr/react-dsfr/Download";
import H5PRenderer from "@/app/(main)/mediaViewers/H5PRenderer";
import EmbedVideo from "@/components/interactifs/EmbedVideo";

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
`;

function H5PContentCard({
    deleteH5p,
    content,
    h5pContentId,
    onEmbedClick,
}: {
    deleteH5p: (contentId: string) => Promise<void>;
    h5pContentId: string;
    content: H5PContent & { documents: DocumentWithChunks[] };
    onEmbedClick: () => void;
}) {
    const downloadH5p = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${content.h5pId}&name=${content.contentType}&media=h5p`;
    const downloadHTML = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${content.h5pId}&name=${content.contentType}&media=html`;

    return (
        <StyledCard
            background
            border
            className="text-left w-full relative z-0"
            desc={
                <div className="relative">
                    <H5PRenderer h5pContentId={h5pContentId} />
                </div>
            }
            end={
                <>
                    <p className="text-xl">
                        {content.documents.length === 0 ? 'Source : Youtube' : 'Source : Universcience'}
                    </p>
                    <div className="flex flex-col gap-4">
                        {content.documents.map((d) => (
                            <DocumentPreview key={d.id} document={d} />
                        ))}
                        <p className="text-xl mb-0 mt-4">Téléchargements</p>
                        <div className="flex gap-2">
                            <Download
                                className="w-full justify-center"
                                label="H5P"
                                details="Télécharger la vidéo interactive en H5P"
                                linkProps={{ href: downloadH5p }}
                            />
                            <Download
                                className="w-full justify-center"
                                label="HTML"
                                details="Télécharger la vidéo interactive en HTML"
                                linkProps={{ href: downloadHTML }}
                            />
                        </div>
                        <div className="flex ml-auto">
                            <EmbedVideo onClick={onEmbedClick} />
                        </div>
                    </div>
                </>
            }
            size="medium"
            title=""
            titleAs="h3"
        />
    );
}

export default H5PContentCard;
