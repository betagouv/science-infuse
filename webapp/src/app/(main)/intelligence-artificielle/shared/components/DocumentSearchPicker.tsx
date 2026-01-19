import SearchPage from "@/app/(main)/recherche/SearchPage";
import { selectedTabType, TabType } from "@/app/(main)/recherche/Tabs";
import { MediaTypes } from "@/types/vectordb";
import SearchBar from "@codegouvfr/react-dsfr/SearchBar";
import { useRef, useState } from "react";
import { GenericDocumentPickerProps } from "../types";

const defaultConfig = {
    searchBarLabel: "Rechercher par mot-clé :",
    searchBarPlaceholder: "Rechercher un document par mot-clé...",
    onInsertedLabel: "Sélectionner",
    mediaTypes: [MediaTypes.VideoTranscript],
    hiddenTabs: [] as TabType[],
    defaultTab: "videos",
    queryFilters: { limit: 100 }
};

export const DocumentSearchPicker = (props: GenericDocumentPickerProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [_query, _setQuery] = useState<string>("");
    const [query, setQuery] = useState<string>("");

    // Merge user config with defaults
    const config = { ...defaultConfig, ...props.config };

    const handleSearch = () => {
        setQuery(_query)
    }

    return <div className="flex flex-col gap-8 w-full items-center">
        <div className="w-full flex flex-col gap-4">

            <p className="m-0 text-base text-left text-[#161616] self-start">{config.searchBarLabel}</p>

            <SearchBar
                className="w-full"
                big
                label={config.searchBarPlaceholder}
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
            onInsertedLabel={config.onInsertedLabel}
            onInserted={(chunk) => {
                props.onDocumentProcessingStart();
                props.onChunkPicked(chunk);
            }}
            query={query}
            queryFilters={config.queryFilters}
            tab={config.defaultTab}
            mediaTypes={config.mediaTypes}
            hiddenTabs={config.hiddenTabs}
            onTabChange={(newTab) => {
                selectedTabType.value = newTab;
            }}
        />}

    </div>
}