"use client";

import { useState } from "react";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { createPortal } from "react-dom";
import { DocumentWithChunks } from "@/types/vectordb";
import { H5PContent } from "@prisma/client";
import H5PContentCard from "./H5PContentCard";
import { MasonaryItem } from "@/components/MasonaryItem";
import Masonry from "@mui/lab/Masonry";
import Pagination from "@codegouvfr/react-dsfr/Pagination";

const embedModal = createModal({ id: "embed-video-modal", isOpenedByDefault: false });

export default function RenderH5pContents({
    deleteH5p,
    contents,
}: {
    deleteH5p: (contentId: string) => Promise<void>;
    contents: (H5PContent & { documents: DocumentWithChunks[] })[];
}) {
    const [page, setPage] = useState(1);
    const [embedUrl, setEmbedUrl] = useState<string | null>(null);
    const isOpen = useIsModalOpen(embedModal);

    const itemsPerPage = 6;
    const startIndex = (page - 1) * itemsPerPage;
    const displayedContents = contents.slice(startIndex, startIndex + itemsPerPage);

    const embedCode = embedUrl
        ? `<iframe style="width: 100%; aspect-ratio: 16/10;" src="${embedUrl}" allow="autoplay;" allowfullscreen></iframe>`
        : "";

    return (
        <div className="flex flex-col gap-4">
            <Masonry columns={2} spacing={2}>
                {displayedContents.map((content) => {
                    const publicUrl = `${process.env.NEXT_PUBLIC_WEBAPP_URL}/embed/h5p/${content.h5pId}`;
                    return (
                        <MasonaryItem className="w-full" key={content.h5pId}>
                            <H5PContentCard
                                content={content}
                                h5pContentId={content.h5pId}
                                deleteH5p={deleteH5p}
                                onEmbedClick={() => {
                                    setEmbedUrl(publicUrl);
                                    embedModal.open();
                                }}
                            />
                        </MasonaryItem>
                    );
                })}
            </Masonry>

            {createPortal(
                <embedModal.Component
                    title="Code d'intégration"
                    className="z-50"
                    buttons={[
                        {
                            iconId: "ri-file-copy-line",
                            onClick: () => embedCode && navigator.clipboard.writeText(embedCode),
                            children: "Copier le code d'intégration",
                        },
                        {
                            iconId: "ri-link-m",
                            onClick: () => embedUrl && navigator.clipboard.writeText(embedUrl),
                            children: "Copier le lien de la vidéo",
                        },
                    ]}
                >
                    <div className="flex flex-row gap-8 p-4">
                        <div className="flex-1">
                            <p className="text-sm text-gray-600 mt-4">
                                Copiez ce code et collez-le dans votre site web pour intégrer cette vidéo.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <code className="text-sm break-all">{embedCode}</code>
                            </div>
                            <p className="text-sm text-gray-600 mt-4">
                                Ou copiez directement le lien de la vidéo.
                            </p>
                            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-4">
                                <code className="text-sm break-all">{embedUrl}</code>
                            </div>
                        </div>
                    </div>
                </embedModal.Component>,
                document.body
            )}

            <div className="flex items-center justify-center z-[1] w-full sticky bottom-0 bg-white pt-4">
                <Pagination
                    className="w-fit"
                    count={Math.ceil(contents.length / itemsPerPage)}
                    defaultPage={page}
                    getPageLinkProps={(page) => ({
                        onClick: () => setPage(page),
                        href: "#",
                    })}
                    showFirstLast
                />
            </div>
        </div>
    );
}
