import { useRef, useState } from "@preact-signals/safe-react/react";
import Input from "@codegouvfr/react-dsfr/Input";
import Button from "@codegouvfr/react-dsfr/Button";
import { apiClient } from "@/lib/api-client";

export default (props: { onDocumentIdPicked: (documentId: string) => void, onDocumentProcessingStart: () => void }) => {


    const inputRef = useRef<HTMLInputElement>(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const isValidYoutubeUrl = (url: string) => {
        const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        return url.match(urlPattern);
    }

    const handleIndexYoutube = async () => {
        props.onDocumentProcessingStart();
        const response = await apiClient.indexFile({ youtubeUrl });
        console.log("uploadFileAndProcess", response)
        props.onDocumentIdPicked(response.documentId)
    }


    return <div className="flex flex-col w-full items-center">
        <div className="w-full flex flex-col gap-8">
            <Input
                className="w-full [&_.fr-label]:pb-2"
                label="Lien URL de la vidéo (Youtube)"
                addon={
                    <Button
                        disabled={!isValidYoutubeUrl(youtubeUrl)}
                        className="w-fit whitespace-nowrap ml-4"
                        onClick={handleIndexYoutube}>
                        Générer quiz et définitions
                    </Button>
                }

                nativeInputProps={{
                    value: youtubeUrl,
                    onChange: event => {
                        const value = event.currentTarget.value;
                        setYoutubeUrl(value)
                    },
                    onKeyDown: event => {
                        if (event.key === "Enter") {
                            handleIndexYoutube();
                        } else if (event.key === "Escape" && inputRef.current) {
                            inputRef.current.blur();
                        }
                    }
                }}
                state={youtubeUrl.length == 0 || isValidYoutubeUrl(youtubeUrl) ? "info" : "error"}
                stateRelatedMessage="Seules les vidéos hébergées sur la plateforme Youtube sont acceptées pour le moment."
            />

        </div>

    </div>
}