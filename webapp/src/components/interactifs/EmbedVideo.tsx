"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { createPortal } from "react-dom";

const modal = createModal({
    id: "embed-video",
    isOpenedByDefault: false
});

export default (props: { videoUrl: string }) => {
    const isOpen = useIsModalOpen(modal);

    const embedCode = `<iframe style="width: 100%; aspect-ratio: 16/10;" src="${props.videoUrl}" allow="autoplay;" allowfullscreen></iframe>`;
    const handleCopyEmbed = () => {
        navigator.clipboard.writeText(embedCode);
    };
    const handleCopyLink = () => {
        navigator.clipboard.writeText(props.videoUrl);
    };

    return (
        <>
            {createPortal(
                <modal.Component
                    className="z-50"
                    title="Code d'intégration"
                    buttons={[
                        {
                            iconId: "ri-file-copy-line",
                            onClick: handleCopyEmbed,
                            children: "Copier le code d'intégration"
                        },
                        {
                            iconId: "ri-link-m",
                            onClick: handleCopyLink,
                            children: "Copier le lien de la vidéo"
                        }
                    ]}>
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
                                <code className="text-sm break-all">{props.videoUrl}</code>
                            </div>
                        </div>
                    </div>
                </modal.Component>,
                document.body
            )}
            <Button
                iconId="ri-link-m"
                onClick={() => modal.open()}
                className="w-full justify-center sm:w-fit"
                priority="secondary"
            >
                Lien d'intégration
            </Button >
        </>
    );
}