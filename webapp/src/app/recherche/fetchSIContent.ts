import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { QueryRequest } from "@/lib/api-client";
import { ChunkSearchResults, DocumentSearchResults } from "@/types/vectordb";
import { QueryFunction } from "@tanstack/react-query";

type SearchResultType = DocumentSearchResults | ChunkSearchResults;

export const fetchSIContent: QueryFunction<SearchResultType, [string, string[] | undefined, number | undefined]> = async ({ queryKey }) => {
  const [query, mediaTypes, limit] = queryKey;
  if (!query) return [];

  const endpoint = `/api/search`;
  // const endpoint = isGrouped
  //   ? `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks_grouped_by_document`
  //   : `${NEXT_PUBLIC_SERVER_URL}/search/search_chunks`;

  const queryData: QueryRequest = {
    query,
    mediaTypes: mediaTypes,
    limit,
  }
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(queryData),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};
