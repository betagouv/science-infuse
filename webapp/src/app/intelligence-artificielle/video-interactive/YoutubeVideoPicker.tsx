import { ChunkWithScoreUnion } from "@/types/vectordb";


import { useRef, useState } from "@preact-signals/safe-react/react";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import Input from "@codegouvfr/react-dsfr/Input";
import Button from "@codegouvfr/react-dsfr/Button";
import { apiClient } from "@/lib/api-client";

export default (props: { onDocumentIdPicked: (documentId: string) => void }) => {


    const inputRef = useRef<HTMLInputElement>(null);
    const [youtubeUrl, setYoutubeUrl] = useState('');

    const isValidYoutubeUrl = (url: string) => {
        const urlPattern = /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        return url.match(urlPattern);
    }

    const handleIndexYoutube = async () => {
        const response = await apiClient.indexFile(undefined, youtubeUrl);
        console.log("uploadFileAndProcess", response)
        props.onDocumentIdPicked(response.documentId)
    }


    return <div className="flex flex-col w-full items-center">
        <div className="w-full flex flex-col gap-8">
            <Input
                className="w-full"
                label="Lien URL de la vidéo"
                addon={<Button disabled={!isValidYoutubeUrl(youtubeUrl)} className="w-fit whitespace-nowrap" onClick={handleIndexYoutube}>Générer quizz et définitions</Button>}

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
                state="info"
                stateRelatedMessage="Seules les vidéos hébergées sur la plateforme Youtube sont acceptées pour le moment."
            />

        </div>

    </div>
}