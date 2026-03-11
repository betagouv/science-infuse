

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useCallback, useEffect, useRef, useState } from "@preact-signals/safe-react/react";
import { useDropzone } from "react-dropzone";
import { apiClient } from "@/lib/api-client";
import Input from "@codegouvfr/react-dsfr/Input";
import { useSnackbar } from "@/app/SnackBarProvider";
import { useAlertToast } from "@/components/AlertToast";

export default (props: { onDocumentIdPicked: (documentId: string) => void, onDocumentProcessingStart: () => void, onError: (message: string) => void }) => {

    const [mediaName, setMediaName] = useState("");
    const [droppedFile, setDroppedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];

        if (file) {
            setDroppedFile(file);
            setMediaName(file.name);
            if (fileInputRef.current) {
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInputRef.current.files = dataTransfer.files;
            }
        }
    }, []);


    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'video/mp4': ['.mp4'],
        },
        multiple: false,
        noClick: true
    });


    const uploadFileAndProcess = async (file: File, mediaName: string) => {
        try {
            props.onDocumentProcessingStart();
            const response = await apiClient.indexFile({ file, mediaName });
            props.onDocumentIdPicked(response.documentId)
        } catch (error) {
            if (error instanceof Error) {
                props.onError(error.message);
            } else {
                props.onError("Une erreur inconnue s'est produite");
            }
        }
    }

    return <div className="flex flex-col w-full items-center">
        <div className="w-full flex flex-col gap-8">

            <div {...getRootProps()} className="flex flex-col w-full items-center gap-8 "
                style={{
                    ...(isDragActive ? { outline: '2px dashed #000091', outlineOffset: '-2px' } : {})
                }}>

                <div className="fr-upload-group w-full">
                    <label className="fr-label" htmlFor="upload-id"> Ajouter un fichier <span className="fr-hint-text">Taille maximale : 100 Mo. Formats supportés : MP4.</span>
                    </label>
                    <div className="flex flex-col w-full gap-4">
                        <div className="flex flex-row items-center">
                            <input ref={fileInputRef} className="fr-upload" aria-describedby="upload-id-messages" type="file" id="upload-id" name="upload" accept=".mp4" onChange={(e) => {
                                if (e.target.files && e.target.files[0]) {
                                    setDroppedFile(e.target.files[0]);
                                    setMediaName(e.target.files[0].name)
                                }
                            }} />
                        </div>
                        {droppedFile && (
                            <div className="flex flex-row items-end justify-between gap-4">
                                <Input
                                    label="Titre de la vidéo"
                                    nativeInputProps={{
                                        type: "text",
                                        value: mediaName,
                                        onChange: (e) => setMediaName(e.target.value),
                                        placeholder: "Source",
                                    }}
                                    className="flex-1 !m-0"
                                />
                                <Button className="whitespace-nowrap" onClick={async (e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    await uploadFileAndProcess(droppedFile, mediaName);
                                }}>Générer quiz et définitions</Button>
                            </div>
                        )}
                    </div>
                    <div className="fr-messages-group" id="upload-id-messages" aria-live="polite">
                    </div>
                </div>
            </div>

        </div>

    </div >
}