"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { CircularProgress } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { ChunkSearchResults, ChunkWithScoreUnion, DocumentSearchResults, MediaType } from "@/types/vectordb";
import { signal } from "@preact/signals-react";
import { getSearchWords } from "./text-highlighter";
import DocumentCardWithChunks from "./DocumentCardWithChunks";
import ChunkRenderer from "./DocumentChunkFull";
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import { DEFAULT_PAGE_NUMBER } from "@/config";
import { fetchSIContent } from "./fetchSIContent";
import Tabs, { ColumnsMediaTypeMap, selectedTabType, TabMediaTypeMap } from "./Tabs";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import Snackbar from "@/course_editor/components/Snackbar";

export const MasonaryItem = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(0.5),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));


// const pageNumber = signal<number>(1)

const Search: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || "";
  const searchWords = getSearchWords(query);
  const [pageNumber, setPageNumber] = useState(1);

  const { data: results, isLoading, isError } = useQuery({
    queryKey: [query, undefined, 1000] as const,
    queryFn: fetchSIContent,
    enabled: !!query,
  });

  const activeTypes = TabMediaTypeMap[selectedTabType.value] || [];
  const chunks = results && (results as ChunkSearchResults).chunks
    ? (results as ChunkSearchResults).chunks.filter(chunk => activeTypes.includes(chunk.mediaType as MediaType))
    : [];

  const resultPerPage = 10
  console.log("PaginationComponent newPageNumber", pageNumber, chunks)

  useEffect(() => {
    setPageNumber(1);
  }, [activeTypes])

  return (
    <div className="w-full fr-grid-row fr-grid-row--center">
      <div className="fr-col-12 fr-container main-content-item">
        <div className="py-16 flex flex-col gap-8 md:px-0">
          <SearchHeader query={query} />
          <Tabs chunks={(results as ChunkSearchResults)?.chunks || []} />
          {isLoading && <LoadingIndicator />}
          {isError && <ErrorMessage />}
          {!isLoading && !isError && !results && <NoResultsMessage />}
          {!isLoading && !isError && results &&
            <ChunkResults
              chunks={chunks.slice((pageNumber-1) * resultPerPage, pageNumber * resultPerPage)}
              searchWords={searchWords}
            />}

          <Pagination
            className="[&_ul]:justify-around"
            // count={100}
            count={Math.max(1, Math.ceil(chunks.length / resultPerPage))}
            defaultPage={Math.max(pageNumber, 1)}
            getPageLinkProps={(newPageNumber: number) => ({
              onClick: (e) => {
                e.preventDefault();
                console.log("PaginationComponent newPageNumber", newPageNumber)
                setPageNumber(newPageNumber)
              },
              href: ``,
            })}
            showFirstLast
          />
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
        <DocumentCardWithChunks key={result.documentId} searchResult={result} searchWords={searchWords} />
      ))}
  </div>
);

const ChunkResults: React.FC<{ chunks: ChunkWithScoreUnion[], searchWords: string[] }> = ({ chunks, searchWords }) => {

  return (
    <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
      {chunks
        .sort((a, b) => b.score - a.score)
        .map((result, index) => (
          <MasonaryItem key={index}>
            <ChunkRenderer chunk={result} searchWords={searchWords} />
          </MasonaryItem>
        ))}
    </Masonry>
  )
};

export default Search;