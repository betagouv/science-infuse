'use client';

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Button } from "@codegouvfr/react-dsfr/Button";
import Alert from "@codegouvfr/react-dsfr/Alert";
import { desindexDocuments } from "@/lib/utils/db";
import { useState } from "react";
import { useRouter } from "next/navigation";

const modal = createModal({
    id: "desindex-documents-modal",
    isOpenedByDefault: false
});


export default function (props: { documentIds: string[] }) {
    const isOpen = useIsModalOpen(modal);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const router = useRouter();

    return (
        <>
            <modal.Component title={`Désindexer des documents`}>
                <div className="flex flex-col gap-4">
                    <Alert
                        severity="warning"
                        // title=""
                        description="Les documents désindexés n'apparaissent pas dans les résultats de recherche"
                        closable={false}
                        small
                    />
                    {errorMessage && (
                        <Alert
                            severity="error"
                            description={errorMessage}
                            closable={false}
                            small
                        />
                    )}
                    <Button
                        onClick={async () => {
                            if (isSubmitting) return;
                            setIsSubmitting(true);
                            setErrorMessage(null);
                            try {
                                await desindexDocuments(props.documentIds);
                                modal.close();
                                router.refresh();
                            } catch (error) {
                                setErrorMessage("Une erreur est survenue lors de la désindexation.");
                            } finally {
                                setIsSubmitting(false);
                            }
                        }}
                        className="w-full justify-center"
                        priority="secondary"
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "Désindexation en cours..."
                            : `Désindexer ${props.documentIds.length} Documents`}
                    </Button>
                </div>
            </modal.Component>
            <Button onClick={() => modal.open()}>Désindexer les documents</Button>
        </>
    );
}