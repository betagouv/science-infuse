"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";

export default function EmbedVideo({ onClick }: { onClick: () => void }) {
    return (
        <Button
            iconId="ri-link-m"
            onClick={onClick}
            className="w-full justify-center sm:w-fit"
            priority="secondary"
        >
            Lien d'intégration
        </Button>
    );
}
