import { Autocomplete, Chip, TextField } from "@mui/material";
import { useEffect, useState } from "react";
import { getAllDocumentTags } from "@/lib/utils/db";
import styled from "@emotion/styled";
import { Tag } from "@codegouvfr/react-dsfr/Tag";
import { DocumentTag } from "@prisma/client";

// Define the type for your tags

const StyledAutocomplete = styled(Autocomplete<DocumentTag, true, false, false>)`
  background: #eeeeee;
  border-bottom: 2px solid black;
  border-radius: 0.25rem 0.25rem 0 0;
  
  fieldset {
    border: none;
    outline: none;
  }
`;

export default function TagSelector({
    selectedDocumentTags,
    setSelectedDocumentTags,
}: {
    selectedDocumentTags: DocumentTag[];
    setSelectedDocumentTags: (documentTags: DocumentTag[]) => void;
}) {
    const [predefinedDocumentTags, setPredefinedDocumentTags] = useState<DocumentTag[]>([]);

    useEffect(() => {
        const fetchTags = async () => {
            const documentTags = await getAllDocumentTags();
            setPredefinedDocumentTags(documentTags);
        };
        fetchTags();
    }, []);

    return (
        <div className="flex flex-col fr-input-group w-full gap-2">
            <label className="fr-label">Tags des documents</label>
            <StyledAutocomplete
                className="w-full border-none outline-none"
                multiple
                options={predefinedDocumentTags}
                value={selectedDocumentTags}
                onChange={(event, newValue) => {
                    setSelectedDocumentTags(newValue);
                }}
                getOptionLabel={(option) => option.title}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        variant="outlined"
                        // label="Sélectionner des tags"
                        placeholder="Tags"
                    />
                )}
                renderTags={(value, getTagProps) => <div className="flex gap-2">

                    {value.map((option, index) => (
                        <Chip
                            {...getTagProps({ index })}
                            label={option.title}
                            key={option.id}
                        />
                    ))}
                </div>
                }
            />
        </div>
    );
}