"use client";

import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ToggleSwitch } from "@codegouvfr/react-dsfr/ToggleSwitch";
import { CircularProgress } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { ChunkSearchResults, DocumentSearchResults, MediaType } from "@/types/vectordb";
import { signal } from "@preact/signals-react";
import { getSearchWords } from "./text-highlighter";
import DocumentCardWithChunks from "./DocumentCardWithChunks";
import ChunkRenderer from "./DocumentChunkFull";
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import { DEFAULT_PAGE_NUMBER } from "@/config";
import SIPagination, { pageNumber } from "./SIPagination";
import { fetchSIContent } from "./fetchSIContent";
import Tabs, { ColumnsMediaTypeMap, selectedTabType, TabMediaTypeMap } from "./Tabs";

const Item = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

const groupByDocument = signal<boolean>(false);

const Search: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || "";
  const searchWords = getSearchWords(query);
  // const queryClient = useQueryClient();

  const { data: results, isLoading, isError } = useQuery({
    queryKey: ['search', query, groupByDocument.value, null, pageNumber.value, DEFAULT_PAGE_NUMBER] as const,
    queryFn: fetchSIContent,
    enabled: !!query,
  });

  const renderSearchResults = () => {
    if (isLoading) return <LoadingIndicator />;
    if (isError) return <ErrorMessage />;
    if (!results) return <NoResultsMessage />;

    return <ChunkResults results={results as ChunkSearchResults} searchWords={searchWords} />;
    // return groupByDocument.value
    //   ? <DocumentResults results={results as DocumentSearchResults} searchWords={searchWords} />
    //   : <ChunkResults results={results as ChunkSearchResults} searchWords={searchWords} />;
  };

  return (
    <div className="w-full fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-container main-content-item">
        <div className="py-16 flex flex-col gap-8 md:px-0">
          <SearchHeader query={query} />
          <Tabs chunks={(results as ChunkSearchResults)?.chunks || []} />
          {renderSearchResults()}
          <SIPagination pageCount={results?.page_count} />
        </div>
      </div>
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
  <p>Une erreur s'est produite lors de la recherche.</p>
);

const NoResultsMessage: React.FC = () => (
  <div className="h-40 w-full flex items-center justify-center">
    <p>Aucun résultat trouvé.</p>
  </div>
);

const DocumentResults: React.FC<{ results: DocumentSearchResults, searchWords: string[] }> = ({ results, searchWords }) => (
  <div className="container flex flex-wrap gap-4 overflow-x-clip">
    {results.documents
      .sort((a, b) => b.max_score - a.max_score)
      .map((result) => (
        <DocumentCardWithChunks key={result.document_id} searchResult={result} searchWords={searchWords} />
      ))}
  </div>
);

const ChunkResults: React.FC<{ results: ChunkSearchResults, searchWords: string[] }> = ({ results, searchWords }) => {
  const activeTypes = TabMediaTypeMap[selectedTabType.value] || [];
  return (
    <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
      {results.chunks
        .sort((a, b) => b.score - a.score)
        .filter(chunk => activeTypes.includes(chunk.media_type as MediaType))
        .map((result, index) => (
          <Item key={index}>
            <ChunkRenderer chunk={result} searchWords={searchWords} />
          </Item>
        ))}
    </Masonry>
  )
};

export default Search;