"use client";

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Pagination } from "@codegouvfr/react-dsfr/Pagination";
import { CircularProgress } from "@mui/material";
import { useSearchParams } from "next/navigation";
import { ChunkSearchResults, ChunkWithScore, ChunkWithScoreUnion, DocumentSearchResults, GroupedVideo, MediaType } from "@/types/vectordb";
import { signal } from "@preact/signals-react";
import { getSearchWords } from "./text-highlighter";
import ChunkRenderer, { RenderGroupedVideoTranscriptCard } from "./DocumentChunkFull";
import Masonry from '@mui/lab/Masonry';
import { styled } from '@mui/material/styles';
import { DEFAULT_PAGE_NUMBER, NEXT_PUBLIC_SERVER_URL } from "@/config";
import { fetchSIContent } from "./fetchSIContent";
import Tabs, { ColumnsMediaTypeMap, selectedTabType, TabMediaTypeMap, TabType } from "./Tabs";
import { useEffect, useState } from "@preact-signals/safe-react/react";
import Snackbar from "@/course_editor/components/Snackbar";
import VideoPlayerHotSpots from "../mediaViewers/VideoPlayerHotSpots";
import { MasonaryItem } from "@/components/MasonaryItem";

const groupVideo = (videoChunks: ChunkWithScore<"video_transcript">[]) => {
  // Group by documentId
  const groupedByDocId = videoChunks.reduce<Record<string, ChunkWithScore<"video_transcript">[]>>((acc, item) => {
    const docId = item.document.id;
    if (!acc[docId]) {
      acc[docId] = [];
    }
    acc[docId].push(item);
    return acc;
  }, {});

  // Calculate max score for each group
  const grouppedVideos = Object.entries(groupedByDocId).map(([docId, items]) => {
    const maxScore = Math.max(...items.map(item => item.score));
    return {
      documentId: docId,
      items: items,
      maxScore: maxScore
    };
  });

  // Sort the result array by maxScore
  grouppedVideos.sort((a, b) => b.maxScore - a.maxScore);

  return grouppedVideos as GroupedVideo[];
};


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

  const resultPerPage = 10

  const chunks = results && (results as ChunkSearchResults).chunks
    ? (results as ChunkSearchResults).chunks
      .filter(chunk => activeTypes.includes(chunk.mediaType as MediaType))
    : [];

  const groupedVideos = useMemo(() => groupVideo(chunks as ChunkWithScore<"video_transcript">[]), [chunks]);

  let pageCount = 1;
  if (selectedTabType.value == TabType.Videos)
    pageCount = Math.max(1, Math.ceil(groupedVideos.length / resultPerPage))
  else
    pageCount = Math.max(1, Math.ceil(chunks.length / resultPerPage))

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
          {!isLoading && !isError && results && (
            selectedTabType.value != TabType.Videos ?
              <ChunkResults
                chunks={chunks.slice((pageNumber - 1) * resultPerPage, pageNumber * resultPerPage)}
                searchWords={searchWords}
              /> :
              <GroupedVideoChunkResults
                groupedVideos={groupedVideos.slice((pageNumber - 1) * resultPerPage, pageNumber * resultPerPage)}
                searchWords={searchWords}
              />
          )
          }

          <Pagination
            className="[&_ul]:justify-around"
            count={pageCount}
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
  <p className="text-center">Une erreur s'est produite lors de la recherche.</p>
);

const NoResultsMessage: React.FC = () => (
  <div className="h-40 w-full flex items-center justify-center">
    <p>Aucun résultat trouvé.</p>
  </div>
);


const GroupedVideoChunkResults: React.FC<{ groupedVideos: GroupedVideo[], searchWords: string[] }> = ({ groupedVideos, searchWords }) => {
  return (
    <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
      {groupedVideos
        .slice()
        .map((video, index) => {
          return (
            <MasonaryItem key={index}>
              <RenderGroupedVideoTranscriptCard video={video} searchWords={searchWords} />
            </MasonaryItem>
          )
        })
      }
    </Masonry>
  )
}

const ChunkResults: React.FC<{ chunks: ChunkWithScoreUnion[], searchWords: string[] }> = ({ chunks, searchWords }) => {
  return <Masonry columns={ColumnsMediaTypeMap[selectedTabType.value]} spacing={2}>
    {chunks
      .sort((a, b) => b.score - a.score)
      .map((result, index) => (
        <MasonaryItem key={index}>
          <ChunkRenderer chunk={result} searchWords={searchWords} />
        </MasonaryItem>
      ))
    }
  </Masonry>
};


export default Search;