import SearchPage from "@/app/(main)/recherche/SearchPage";
import { TabType } from "@/app/(main)/recherche/Tabs";
import { MediaTypes } from "@/types/vectordb";
import type { FormEvent } from "react";
import { useId, useRef, useState } from "react";
import { GenericDocumentPickerProps } from "../types";

const defaultConfig = {
    searchBarLabel: "Rechercher par mot-clé :",
    searchBarPlaceholder: "Rechercher un document par mot-clé...",
    onInsertedLabel: "Sélectionner",
    mediaTypes: [MediaTypes.VideoTranscript],
    hiddenTabs: [] as TabType[],
    defaultTab: TabType.Videos,
    queryFilters: { limit: 100 }
};

export const DocumentSearchPicker = (props: GenericDocumentPickerProps) => {
    const inputId = useId();
    const inputRef = useRef<HTMLInputElement>(null);
    const [_query, _setQuery] = useState<string>("");
    const [query, setQuery] = useState<string>("");

    // Merge user config with defaults
    const config = { ...defaultConfig, ...props.config };

    const handleSearch = (event?: FormEvent<HTMLFormElement>) => {
        event?.preventDefault();
        setQuery(_query.trim())
    }

    return <div className="flex flex-col gap-8 w-full items-center">
        <div className="w-full flex flex-col gap-4">

            <p className="m-0 text-base text-left text-[#161616] self-start">{config.searchBarLabel}</p>

            <form className="fr-search-bar fr-search-bar--big w-full" role="search" onSubmit={handleSearch}>
                <label className="fr-label" htmlFor={inputId}>
                    {config.searchBarPlaceholder}
                </label>
                <input
                    ref={inputRef}
                    className="fr-input"
                    id={inputId}
                    placeholder={config.searchBarPlaceholder}
                    type="search"
                    value={_query}
                    onChange={event => {
                        const value = event.currentTarget.value;
                        _setQuery(value)
                    }}
                    onKeyDown={event => {
                        if (event.key === "Escape" && inputRef.current) {
                            inputRef.current.blur();
                        }
                    }}
                />
                <button className="fr-btn" title="Rechercher" type="submit">
                    Rechercher
                </button>
            </form>
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
        />}

    </div>
}
