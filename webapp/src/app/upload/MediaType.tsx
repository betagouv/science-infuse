import { Button } from "@codegouvfr/react-dsfr/Button";
import React from "react";
import { Select } from "@codegouvfr/react-dsfr/Select";
import { Typography } from "@mui/material";
import { mediaType, mediaTypes, UploadStep, uploadStep } from "./UploadMediaStepper";


const MediaTypePicker = () => {
    return (
        <>
            <Select
                label={<Typography variant="h2" gutterBottom>Type de media</Typography>}
                id="mediaType"
                nativeSelectProps={{
                    value: mediaType.value,
                    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
                        mediaType.value = e.target.value;
                    }
                }}

            >
                {mediaTypes.map(mt => (
                    <option value={mt}>{mt}</option>
                ))}
            </Select>
            <Button
                iconId="ri-arrow-right-line"
                iconPosition="right"
                onClick={() => {
                    uploadStep.value = UploadStep.UPLOAD_MEDIA;
                }}
            >
                Valider et passer à l'étape suivante
            </Button>
        </>

    )
}

export default MediaTypePicker