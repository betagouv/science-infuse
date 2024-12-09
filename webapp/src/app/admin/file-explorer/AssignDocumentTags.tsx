// "use client"; 

import { createModal } from "@codegouvfr/react-dsfr/Modal";
import { useIsModalOpen } from "@codegouvfr/react-dsfr/Modal/useIsModalOpen";
import { Button } from "@codegouvfr/react-dsfr/Button";
import { Autocomplete, Chip, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { assignTagsToDocuments, getAllDocumentTags } from "@/lib/utils/db";

const modal = createModal({
    id: "assign-document-tags-modal",
    isOpenedByDefault: false
});


export default function (props: { documentIds: string[] }) {
    const isOpen = useIsModalOpen(modal);
    const [selectedLabels, setSelectedLabels] = useState<{ id: string, title: string }[]>([]);
    const [predefinedLabels, setPredefinedLabels] = useState<{ id: string, title: string }[]>([]);

    useEffect(() => {
        const fetchTags = async () => {
            const tags = await getAllDocumentTags();
            setPredefinedLabels(tags);
        };
        fetchTags();
    }, []);
    console.log(`Modal is currently: ${isOpen ? "open" : "closed"}`);

    return (
        <>
            <modal.Component title={`Assigner des Tags aux ${props.documentIds.length} documents`}>
                <div className="flex flex-col gap-4">

                    <Autocomplete
                        multiple
                        options={predefinedLabels}
                        value={selectedLabels}
                        onChange={(event, newValue) => {
                            setSelectedLabels(newValue);
                        }}
                        getOptionLabel={(option) => option.title}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                variant="outlined"
                                label="Sélectionner des tags"
                                placeholder="Tags"
                            />
                        )}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    label={option.title}
                                    {...getTagProps({ index })}
                                    key={option.id}
                                />
                            ))
                        }
                    />

                    {selectedLabels.length > 0 &&
                        <Button
                            onClick={async () => {
                                assignTagsToDocuments(props.documentIds, selectedLabels.map(l => l.id))
                            }}
                            className="w-full justify-center" priority="secondary"
                        >
                            Assigner {selectedLabels.length} tags à {props.documentIds.length} Documents
                        </Button>}
                </div>
            </modal.Component>
            <Button onClick={() => modal.open()}>Assigner des tags</Button>
        </>
    );
}