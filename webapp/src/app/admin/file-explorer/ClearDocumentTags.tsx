// "use client"; 

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { assignTagsToDocuments, getAllDocumentTags, removeAllTagsFromDocuments } from "./actions";

const modal = createModal({
    id: "clear-document-tags-modal",
    isOpenedByDefault: false
});


export default function (props: { documentIds: string[] }) {
    const isOpen = useIsModalOpen(modal);

    return (
        <>
            <modal.Component title={`Assigner des Tags aux ${props.documentIds.length} documents`}>
                <div className="flex flex-col gap-4">
                        <Button
                            onClick={async () => {
                                removeAllTagsFromDocuments(props.documentIds)
                            }}
                            className="w-full justify-center" priority="secondary"
                        >
                            Supprimer tous les tags des {props.documentIds.length} Documents
                        </Button>
                </div>
            </modal.Component>
            <Button onClick={() => modal.open()}>Supprimer tous les tags</Button>
        </>
    );
}