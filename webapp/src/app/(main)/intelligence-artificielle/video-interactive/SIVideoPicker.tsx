import SearchPage from "@/app/(main)/recherche/SearchPage";
import { selectedTabType, TabType } from "@/app/(main)/recherche/Tabs";
import { MediaTypes } from "@/types/vectordb";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { useRef, useState } from "react";

export default (props: { onDocumentIdPicked: (documentId: string) => void, onDocumentProcessingStart: () => void, onError: (message: string) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [_query, _setQuery] = useState<string>("");
    const [query, setQuery] = useState<string>("");

    const handleSearch = () => {
        setQuery(_query)
    }


    return <div className="flex flex-col gap-8 w-full items-center">
        <div className="w-full flex flex-col gap-4">

            <p className="m-0 text-base text-left text-[#161616] self-start">Rechercher par mot-clé :</p>

            <SearchBar
                className="w-full"
                big
                label="Rechercher une vidéo par mot-clé..."
                onButtonClick={handleSearch}
                renderInput={({ className, id, placeholder, type }) => (
                    <input
                        ref={inputRef}
                        className={`${className}`}
                        id={id}
                        placeholder={placeholder}
                        type={type}
                        value={_query}
                        onChange={event => {
                            const value = event.currentTarget.value;
                            _setQuery(value)
                        }}
                        onKeyDown={event => {
                            if (event.key === "Enter") {
                                handleSearch();
                            } else if (event.key === "Escape" && inputRef.current) {
                                inputRef.current.blur();
                            }
                        }}
                    />
                )}
            />
        </div>


        {query && <SearchPage
            onInsertedLabel="Générer quiz et définitions"
            onInserted={(chunk) => {
                props.onDocumentProcessingStart();
                props.onDocumentIdPicked(chunk.document.id);
            }}
            query={query}
            queryFilters={{ limit: 100, mediaTypes: [MediaTypes.VideoTranscript], maxDuration: 600 }}
            tab="videos"
            mediaTypes={[MediaTypes.VideoTranscript]}
            hiddenTabs={[TabType.Chapters, TabType.Documents, TabType.Games, TabType.Others, TabType.Pictures]}
            onTabChange={(newTab) => {
                selectedTabType.value = newTab;
            }}
        />}

    </div>
}