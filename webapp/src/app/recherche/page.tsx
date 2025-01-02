"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { CircularProgress } from "@mui/material";
import { useRouter, useSearchParams } from "next/navigation";
import { SearchResults, ChunkWithScore, GroupedVideo, MediaType } from "@/types/vectordb";
import { getSearchWords } from "./text-highlighter";
import { fetchSIContent } from "./fetchSIContent";
import Tabs, { selectedTabType, TabMediaTypeMap, TabType } from "./Tabs";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import Snackbar from "@/course_editor/components/Snackbar";
import { BlockResults, ChunkResults, GroupedVideoChunkResults, RenderSearchResult } from "./RenderSearch";
import { useSession } from "next-auth/react";



const Search: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || "";
  const urlTabType = searchParams.get('tab') || "";
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
    <div className="w-full fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-container main-content-item">
        <div className="py-16 flex flex-col gap-8 md:px-0">
          <SearchHeader query={query} />
          <Tabs
            favourites={[]}
            blocks={(results as SearchResults)?.blocks || []}
            chunks={(results as SearchResults)?.chunks || []}
            selectedTabType={selectedTabType.value}
            onTabChange={(newTab) => {
              console.log("TABTYPEEE", newTab)
              const url = new URL(window.location.href);
              url.searchParams.set('tab', newTab);
              push(url.toString());
              selectedTabType.value = newTab;
            }}
          />
          {isLoading && <LoadingIndicator />}
          {isError && <ErrorMessage />}
          {!isLoading && !isError && !results && <NoResultsMessage />}
          {!isLoading && !isError && results && (
            <RenderSearchResult
              favourites={[]}
              selectedTab={selectedTabType.value}
              results={results}
              searchWords={searchWords}
              resultPerPage={resultPerPage}
            />
          )}
        </div>
      </div>
      <Snackbar />
    </div>
  );
};

const SearchHeader: React.FC<{ query: string }> = ({ query }) => (
  <div className="flex flex-col items-center text-center px-4 sm:px-0">
    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-black mb-2">
      Résultats de la recherche
    </h1>
    <p className="text-lg sm:text-xl text-black">"{query}"</p>
  </div>
);

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



export default Search;