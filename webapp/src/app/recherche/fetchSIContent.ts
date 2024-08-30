import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { ChunkSearchResults, DocumentSearchResults } from "@/types/vectordb";
import { QueryFunction } from "@tanstack/react-query";

type SearchResultType = DocumentSearchResults | ChunkSearchResults;

export const fetchSIContent: QueryFunction<SearchResultType, [string, string, boolean, string[] | null, number, number]> = async ({ queryKey }) => {
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
      media_types: mediaTypes?.length ? mediaTypes : null,
      page_number: pageNumber,
      page_size: pageSize
    }),
  });

  if (!response.ok) {
    throw new Error('Network response was not ok');
  }

  return response.json();
};
