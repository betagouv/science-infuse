"use client";

import { Button } from "@codegouvfr/react-dsfr/Button";
import React from "react";
import { signal } from "@preact/signals-react";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import MediaTypePicker from "./MediaType";
import FileUploader from "./FileUploader";

export enum UploadStep {
    CHOOSE_MEDIA_TYPE = "step_choose_mediaType",
    UPLOAD_MEDIA = "step_upload_media",
}

const stepIndexMap = {
    [UploadStep.CHOOSE_MEDIA_TYPE]: 0,
    [UploadStep.UPLOAD_MEDIA]: 1,
}

export const uploadStep = signal<UploadStep>(UploadStep.CHOOSE_MEDIA_TYPE);
export const mediaTypes = ["pdf", "video", "text"]
export const mediaType = signal<string>("text");

const steps = [
    { title: 'Type de média', emoji: '📝', description: 'Je choisis mon type de média' },
    { title: 'Envoyer', emoji: '📤', description: "J'envoie mon média" },
]



const UploadMediaStepper = () => {

    const stepIndex = stepIndexMap[uploadStep.value];




    return (
        <div className="py-32 flex flex-col gap-4">

            <Button
                iconId="ri-arrow-left-line"
                onClick={() => {
                    uploadStep.value = UploadStep.CHOOSE_MEDIA_TYPE;
                }}
            >
                Revenir à l'étape précédente
            </Button>

            <Stepper
                currentStep={stepIndex + 1}
                nextTitle={steps[stepIndex + 1]?.title}
                stepCount={steps.length}
                title={steps[stepIndex].description}
            />
            {uploadStep.value === UploadStep.CHOOSE_MEDIA_TYPE && <MediaTypePicker />}
            {uploadStep.value === UploadStep.UPLOAD_MEDIA && <FileUploader />}

        </div>
    );
};

export default UploadMediaStepper;
