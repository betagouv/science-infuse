"use client";

import React from "react";
import { CircularProgress } from "@mui/material";
import { ChunkWithScoreUnion, MediaType } from "@/types/vectordb";
import { getSearchWords } from "./text-highlighter";
import { useTrackedSearch } from "@/hooks/useTrackedSearch";
import Tabs, { TabType } from "./Tabs";
import { useState, useEffect } from "react";
import Snackbar from "@/course_editor/components/Snackbar";
import { RenderSearchResult } from "./RenderSearch";
import { QueryFilters } from "@/types/api";



const SearchPage = (props: { query: string, queryFilters?: QueryFilters, tab?: string, mediaTypes?: MediaType[], onInsertedLabel?: string, onInserted?: (chunk: ChunkWithScoreUnion) => void, hiddenTabs?: TabType[], onTabChange?: (newTab: TabType) => void }, onInserted?: (chunk: ChunkWithScoreUnion) => void) => {
    const query = props.query;
    const urlTabType = props.tab || "";
    const searchWords = getSearchWords(query);

    const { data: results, isLoading, isError } = useTrackedSearch({
        query,
        filters: props.queryFilters
    });

    // Helper to validate and normalize tab type
    const normalizeTab = (tab: string): TabType => {
        // Check if it's a valid TabType enum value
        if (Object.values(TabType).includes(tab as TabType)) {
            return tab as TabType;
        }
        return TabType.Videos;
    };

    const getVisibleDefaultTab = (tab: string): TabType => {
        const requestedTab = normalizeTab(tab);
        if (!props.hiddenTabs?.includes(requestedTab)) {
            return requestedTab;
        }

        if (!props.hiddenTabs?.includes(TabType.Pictures)) {
            return TabType.Pictures;
        }

        return Object.values(TabType).find(tabType =>
            tabType !== TabType.Favourites && !props.hiddenTabs?.includes(tabType)
        ) || Object.values(TabType).find(tabType => !props.hiddenTabs?.includes(tabType)) || TabType.Videos;
    };

    // Derive the active tab from URL - always use the URL value when available
    // Use state to track user clicks, but initialize from props
    const [localTab, setLocalTab] = useState<TabType>(() => {
        return getVisibleDefaultTab(urlTabType);
    });

    // Sync with URL when it changes
    useEffect(() => {
        setLocalTab(getVisibleDefaultTab(urlTabType));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [urlTabType, props.hiddenTabs?.join(',')]);

    const resultPerPage = 10
    const chunks = results ? !props.mediaTypes ? results.chunks : results.chunks.filter(c => props.mediaTypes?.includes(c.mediaType)) : [];
    const blocks = results ? results.blocks : [];

    return (
        <div className="flex w-full flex-col">
            <Tabs
                hiddenTabs={props.hiddenTabs}
                favourites={[]}
                blocks={blocks}
                chunks={chunks}
                selectedTabType={localTab}
                onTabChange={(newTab) => {
                    // Update local state when user clicks
                    setLocalTab(newTab);
                    props.onTabChange && props.onTabChange(newTab);
                }}
            />
            {isLoading && <LoadingIndicator />}
            {isError && <ErrorMessage />}
            {!isLoading && !isError && !results && <NoResultsMessage />}
            {
                !isLoading && !isError && results && (
                    <RenderSearchResult
                        onInserted={props.onInserted}
                        onInsertedLabel={props.onInsertedLabel}
                        favourites={[]}
                        selectedTab={localTab}
                        results={{ ...results, blocks, chunks }}
                        searchWords={searchWords}
                        resultPerPage={resultPerPage}
                    />
                )
            }
            <Snackbar />
        </div >
    );
};

const LoadingIndicator: React.FC = () => (
    <div className="h-40 w-full flex items-center justify-center">
        <CircularProgress className="ml-2" />
    </div>
);

const ErrorMessage: React.FC = () => (
    <p className="text-center">Une erreur s'est produite lors de la recherche.</p>
);

const NoResultsMessage: React.FC = () => (
    <div className="h-40 w-full flex items-center justify-center">
        <p>Aucun résultat trouvé.</p>
    </div>
);



export default SearchPage;
