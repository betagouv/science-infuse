"use client";

import { DocumentPreview } from "@/app/recherche/DocumentChunkFull";
import { DocumentWithChunks } from "@/types/vectordb";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Card from "@codegouvfr/react-dsfr/Card";
import styled from "@emotion/styled";
import { H5PContent } from "@prisma/client";
import { Download } from "@codegouvfr/react-dsfr/Download";
import { IframeHTMLAttributes, useEffect, useRef } from "react";

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
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const handleMessage = (event: { data: { type: string; height: any; }; }) => {
            if (
                event.data &&
                event.data.type === 'setHeight' &&
                typeof event.data.height === 'number'
            ) {
                console.log("handleMessage", event.data)
                if (iframeRef.current) {
                    iframeRef.current.style.height = `${event.data.height+50}px`;
                }
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const downloadH5p = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${content.h5pId}&name=${content.contentType}&media=h5p`;
    const downloadHTML = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/api/export/h5p?id=${content.h5pId}&name=${content.contentType}&media=html`;

    return (
        <StyledCard
            background
            border
            className="text-left w-full"
            desc={
                <div className="relative">
                    <iframe
                        ref={iframeRef}
                        className="w-full overflow-hidden"
                        src={h5pPublicUrl}
                        style={{ border: 'none', minHeight: '300px' }} // use minHeight instead of a fixed height
                        title="H5P Content"
                    />
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