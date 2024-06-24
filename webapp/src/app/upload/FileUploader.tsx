import { Button } from "@codegouvfr/react-dsfr/Button";
import React, { useState } from "react";
import { Upload } from "@codegouvfr/react-dsfr/Upload";
import { Typography } from "@mui/material";
import axios from "axios";
import { mediaType } from "./UploadMediaStepper";


const FileUploader = () => {
    const [file, setFile] = useState<File | null>(null);
    const [publicPath, setPublicPath] = useState<string>("text");
    const [message, setMessage] = useState<string>("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setMessage("Please select a file.");
            return;
        }

        const formData = new FormData();
        formData.append("file", file);
        formData.append("media_type", mediaType.value);
        formData.append("public_path", publicPath);

        try {
            const response = await axios.post(
                "http://localhost:8000/document/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );
            setMessage(response.data.message);
        } catch (error) {
            console.error("Error uploading file:", error);
            setMessage("Error uploading file.");
        }
    };


    return (

        <div className="flex flex-col gap-8">
            <Upload
                label={<Typography variant="h2" gutterBottom>Téléverser mon ficher</Typography>}
                hint="Texte de description"
                nativeInputProps={{
                    onChange: handleFileChange
                }}
                state="default"
                stateRelatedMessage="Erreur lors du téléversement du fichier"
            />

            <Button
                iconId="ri-upload-2-line"
                onClick={handleUpload}
            >
                Téléverser
            </Button>
            {message && <p>{message}</p>}
        </div>

    )
}

export default FileUploader