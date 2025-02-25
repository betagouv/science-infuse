import Search from "@/app/recherche/page";
import SearchPage from "@/app/recherche/SearchPage";
import { selectedTabType, TabType } from "@/app/recherche/Tabs";
import { ChunkWithScoreUnion } from "@/types/vectordb";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { Stepper } from "@codegouvfr/react-dsfr/Stepper";
import { useRef, useState } from "react";


export default (props: { onDocumentIdPicked: (documentId: string) => void }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [_query, _setQuery] = useState<string>("");
    const [query, setQuery] = useState<string>("");

    const handleSearch = () => {
        setQuery(_query)
    }


    return <div className="flex flex-col gap-8 w-full items-center">
        <div className="w-full flex flex-col gap-2">

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
            onInserted={(chunk) => {
                console.log("INSERTED CHUNK", chunk)
                props.onDocumentIdPicked(chunk.document.id);
            }}
            query={query}
            tab="videos"
            hiddenTabs={[TabType.Chapters, TabType.Documents, TabType.Games, TabType.Others, TabType.Pictures]}
            onTabChange={(newTab) => {
                selectedTabType.value = newTab;
            }}
        />}

    </div>
}