"use client";

import { DocumentPreview } from "@/app/recherche/DocumentChunkFull";
import { DocumentWithChunks } from "@/types/vectordb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import styled from "@emotion/styled";
import { H5PContent } from "@prisma/client";
import { Download } from "@codegouvfr/react-dsfr/Download";

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
function H5PContentCard({ content, h5pPublicUrl }: { h5pPublicUrl: string, content: H5PContent & { documents: DocumentWithChunks[] } }) {
    const downloadH5p = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${content.h5pId}&name=${content.contentType}&media=h5p`;
    const downloadHTML = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${content.h5pId}&name=${content.contentType}&media=html`;
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
                <>
                    <p className="text-xl">{content.documents.length == 0 ? "Aucun document de la bibliothèque Universcience n'est lié à cet interactif" : "Documents sources"}</p>
                    <div className="flex flex-col gap-4">
                        {content.documents.map(d => (
                            <DocumentPreview key={d.id} document={d} />
                        ))}
                        <p className="text-xl mb-0 mt-4">Téléchargements</p>
                        <div className="flex gap-2">
                            <Download
                                className="w-full justify-center"
                                label="H5P"
                                details="Télécharger la vidéo interactive en H5P"
                                linkProps={{
                                    href: downloadH5p
                                }}
                            />
                            <Download
                                className="w-full justify-center"
                                label="HTML"
                                details="Télécharger la vidéo interactive en HTML"
                                linkProps={{
                                    href: downloadHTML
                                }}
                            />
                        </div>
                    </div>
                </>
            }
            size="medium"
            title={""}
            titleAs="h3"
        />
    );
}

export default H5PContentCard;