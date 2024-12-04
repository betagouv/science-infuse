// "use client"; 

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { desindexDocuments } from "./actions";
import Alert from "@codegouvfr/react-dsfr/Alert";

const modal = createModal({
    id: "desindex-documents-modal",
    isOpenedByDefault: false
});


export default function (props: { documentIds: string[] }) {
    const isOpen = useIsModalOpen(modal);

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
                    <Button
                        onClick={async () => {
                            await desindexDocuments(props.documentIds)
                        }}
                        className="w-full justify-center" priority="secondary"
                    >
                        Désindexer {props.documentIds.length} Documents
                    </Button>
                </div>
            </modal.Component>
            <Button onClick={() => modal.open()}>Désindexer les documents</Button>
        </>
    );
}