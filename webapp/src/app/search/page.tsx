"use client";

import React, { useEffect, useState } from "react";
import { QueryFunction, useQuery, useQueryClient } from "@tanstack/react-query";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { SearchBar } from "@codegouvfr/react-dsfr/SearchBar";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import assert from "assert";
import { CircularProgress, Typography } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { ChunkSearchResults, ChunkWithScoreUnion, DocumentSearchResult, DocumentSearchResults } from "@/types/vectordb";
import { signal } from "@preact/signals-react";
import { getSearchWords } from "./text-highlighter";
import DocumentCardWithChunks from "./DocumentCardWithChunks";
import FilterMenu, { checkedMediaTypes } from "./FilterMenu";
import ChunkRenderer from "./DocumentChunkFull";
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import { DEFAULT_PAGE_NUMBER, NEXT_PUBLIC_SERVER_URL } from "@/config";
import { SearchQueryProvider } from "./SearchQueryProvider";
import SIPagination, { pageNumber } from "./SIPagination";

const Item = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const groupByDocument = signal<boolean>(false);

type SearchResultType = DocumentSearchResults | ChunkSearchResults;

const fetchSearchResults: QueryFunction<SearchResultType, [string, string, boolean, string[], number, number]> = async ({ queryKey }) => {
  const [_, query, isGrouped, mediaTypes, pageNumber, pageSize] = queryKey;
  if (!query) return [];

  const endpoint = isGrouped
    ? `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks_grouped_by_document`
    : `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      media_types: mediaTypes.length > 0 ? mediaTypes : null,
      page_number: pageNumber,
      page_size: pageSize
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};

const Search: React.FC = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('query') || "";
  const [query, setQuery] = useState<string>(searchQuery);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const [inputElement, setInputElement] = useState<HTMLInputElement | null>(null);
  const searchWords = getSearchWords(query);

  const queryClient = useQueryClient();

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search', debouncedQuery, groupByDocument.value, checkedMediaTypes.value, pageNumber.value, DEFAULT_PAGE_NUMBER] as const,
    queryFn: fetchSearchResults,
    enabled: !!debouncedQuery,
  },);

  const handleSearch = () => {
    queryClient.invalidateQueries({ queryKey: ['search'] });
  };

  return (
    <div className="py-8 flex flex-col gap-4 px-4 md:px-0">
      <Typography variant="h1" gutterBottom>Rechercher des médias</Typography>

      <div className="flex flex-col gap-4">
        <ToggleSwitch
          inputTitle="the-title"
          showCheckedHint={false}
          checked={groupByDocument.value}
          onChange={() => {
            groupByDocument.value = !groupByDocument.value;
            handleSearch();
          }}
          label="Grouper la recherche par document"
          labelPosition="right"
        />

        <SearchBar
          big
          onButtonClick={handleSearch}
          renderInput={({ className, id, placeholder, type }) => (
            <input
              ref={setInputElement}
              className={className}
              id={id}
              placeholder={placeholder}
              type={type}
              value={query}
              onChange={event => setQuery(event.currentTarget.value)}
              onKeyDown={event => {
                if (event.key === "Enter") {
                  handleSearch();
                } else if (event.key === "Escape") {
                  assert(inputElement !== null);
                  inputElement.blur();
                }
              }}
            />
          )}
        />
        <FilterMenu />
      </div>

      {isLoading ? (
        <div className="h-40 w-full flex items-center justify-center">
          <CircularProgress className="ml-2" />
        </div>
      ) : isError ? (
        <p>Une erreur s'est produite lors de la recherche.</p>

      ) : results ? (
        <div className="container flex flex-wrap gap-4">
          {groupByDocument.value ? (
            (results as DocumentSearchResults).documents.sort((a, b) => b.max_score - a.max_score).map((result) => (
              <DocumentCardWithChunks key={result.document_id} searchResult={result} searchWords={searchWords} />
            ))
          ) : (
            <Masonry columns={2} spacing={2}>
              {(results as ChunkSearchResults).chunks.sort((a, b) => b.score - a.score).map((result, index) => (
              // {(results as ChunkSearchResults).chunks.sort((a, b) => b.score - a.score).map((result, index) => (
                <Item key={index}>
                  <ChunkRenderer key={result.uuid} chunk={result} searchWords={searchWords} />
                </Item>
              ))}
            </Masonry>
          )}
        </div>
      ) : (
        <div className="h-40 w-full flex items-center justify-center">
          <p>Aucun résultat trouvé.</p>
        </div>
      )}
      <SIPagination pageCount={results?.page_count} />
    </div>
  );
};

export default function () {
  return (
    <SearchQueryProvider>
      <Search />
    </SearchQueryProvider>
  );
}