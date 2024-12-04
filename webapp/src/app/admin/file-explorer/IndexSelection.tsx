// "use client"; 

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { indexDocuments } from "./actions";
import Alert from "@codegouvfr/react-dsfr/Alert";

const modal = createModal({
    id: "index-documents-modal",
    isOpenedByDefault: false
});


export default function (props: { documentIds: string[] }) {
    const isOpen = useIsModalOpen(modal);

    return (
        <>
            <modal.Component title={`Indexer des documents`}>
                <div className="flex flex-col gap-4">
                    <Alert
                        severity="warning"
                        description="Les documents indexés apparaissent dans les résultats de recherche"
                        closable={false}
                        small
                    />
                    <Button
                        onClick={async () => {
                            await indexDocuments(props.documentIds)
                        }}
                        className="w-full justify-center" priority="secondary"
                    >
                        Indexer {props.documentIds.length} Documents
                    </Button>
                </div>
            </modal.Component>
            <Button onClick={() => modal.open()}>Indexer les documents</Button>
        </>
    );
}