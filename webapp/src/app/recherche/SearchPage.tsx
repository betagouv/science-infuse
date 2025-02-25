"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { CircularProgress } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { ChunkWithScoreUnion, SearchResults } from "@/types/vectordb";
import { getSearchWords } from "./text-highlighter";
import { fetchSIContent } from "./fetchSIContent";
import Tabs, { selectedTabType, TabType } from "./Tabs";
import { useEffect } from "@preact-signals/safe-react/react";
import Snackbar from "@/course_editor/components/Snackbar";
import { RenderSearchResult } from "./RenderSearch";
import { useSession } from "next-auth/react";



const SearchPage = (props: { query: string, tab?: string, onInserted?: (chunk: ChunkWithScoreUnion) => void, hiddenTabs?: TabType[], onTabChange?: (newTab: TabType) => void }, onInserted?: (chunk: ChunkWithScoreUnion) => void) => {
    const query = props.query;
    const urlTabType = props.tab || "";
    const searchWords = getSearchWords(query);
    const { push } = useRouter();
    const { data: session } = useSession();
    const user = session?.user;

    const { data: results, isLoading, isError } = useQuery({
        queryKey: [query, undefined, 1000] as const,
        queryFn: fetchSIContent,
        enabled: !!query,
    });

    useEffect(() => {
        if (!urlTabType) return;
        setTimeout(() => {
            selectedTabType.value = urlTabType as TabType;
        }, 1000)
    }, [urlTabType, user])

    const resultPerPage = 10




    return (
        <div className="flex w-full flex-col">
            <Tabs
                hiddenTabs={props.hiddenTabs}
                favourites={[]}
                blocks={(results as SearchResults)?.blocks || []}
                chunks={(results as SearchResults)?.chunks || []}
                selectedTabType={selectedTabType.value}
                onTabChange={(newTab) => {
                    props.onTabChange && props.onTabChange(newTab)
                }}
            />
            {isLoading && <LoadingIndicator />}
            {isError && <ErrorMessage />}
            {!isLoading && !isError && !results && <NoResultsMessage />}
            {
                !isLoading && !isError && results && (
                    <RenderSearchResult
                        onInserted={props.onInserted}
                        favourites={[]}
                        selectedTab={selectedTabType.value}
                        results={results}
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