"use client";

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import React, { useEffect, useState } from "react";
import useWindowSize from "@/course_editor/hooks/useWindowSize";
import { startReactDsfr } from "@codegouvfr/react-dsfr/spa";

const modal = createModal({
    id: "modal-prefer-desktop",
    isOpenedByDefault: false
});

const MobileNotSupportedModal = () => {
    const isOpen = useIsModalOpen(modal);
    const { isMobile } = useWindowSize();
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const initializeDsfr = async () => {
            await startReactDsfr({ defaultColorScheme: "system" });
            setIsInitialized(true);
        };

        initializeDsfr();
    }, []);

    useEffect(() => {
        if (isInitialized && isMobile) {
            console.log("ISMOBILE", isMobile, modal);
            try {
                modal.open();
            } catch (error) {
                console.error("Error opening modal:", error);
            }
        }
    }, [isMobile, isInitialized, modal]);


    if (!isInitialized) {
        return null; // or a loading indicator
    }

    return (
        <modal.Component title="Affichage sur mobile">
            <p className="text-base text-left text-[#3a3a3a] max-w-full sm:max-w-[524px]">
                Le site n'est pas optimal pour le mobile. Nous vous conseillons d'utiliser le service Science
                Infuse sur l'ordinateur.
            </p>
        </modal.Component>
    );
}

export default MobileNotSupportedModal;