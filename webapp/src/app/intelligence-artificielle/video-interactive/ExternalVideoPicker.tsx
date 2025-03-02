

import { Button } from "@codegouvfr/react-dsfr/Button";
import { useCallback, useRef, useState } from "@preact-signals/safe-react/react";
import { useDropzone } from "react-dropzone";
import { apiClient } from "@/lib/api-client";

export default (props: { onDocumentIdPicked: (documentId: string) => void, onDocumentProcessingStart: () => void }) => {

    const [isUploading, setIsUploading] = useState(false);
    const [droppedFile, setDroppedFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setDroppedFile(file);
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



    const uploadFileAndProcess = async (file: File) => {
        const response = await apiClient.indexFile(file);
        console.log("uploadFileAndProcess", response)
        props.onDocumentIdPicked(response.documentId)
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
                    <div className="flex flex-row items-center">

                        <input ref={fileInputRef} className="fr-upload" aria-describedby="upload-id-messages" type="file" id="upload-id" name="upload" accept=".mp4" onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                                setDroppedFile(e.target.files[0]);
                            }
                        }} />
                        {
                            droppedFile && <Button className="whitespace-nowrap" onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                props.onDocumentProcessingStart();
                                await uploadFileAndProcess(droppedFile);
                            }}>Générer quizz et définitions</Button>
                        }

                    </div>
                    <div className="fr-messages-group" id="upload-id-messages" aria-live="polite">
                    </div>
                </div>

                {/* {droppedFile && (
                    <div className="flex flex-col gap-4 w-full items-center">
                        <RenderImportedFile isUploading={isUploading} file={droppedFile} onRemove={() => {
                            setDroppedFile(null);
                            if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                            }
                        }} />
                    </div>
                )} */}

            </div>

        </div>

    </div >
}