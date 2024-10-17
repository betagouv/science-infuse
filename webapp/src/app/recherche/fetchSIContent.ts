import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { apiClient } from "@/lib/api-client";
import { QueryRequest } from "@/types/api";
import { SearchResults, DocumentSearchResults } from "@/types/vectordb";
import { QueryFunction } from "@tanstack/react-query";


export const fetchSIContent: QueryFunction<SearchResults, [string, string[] | undefined, number | undefined]> = async ({ queryKey }) => {
  const [query, mediaTypes, limit] = queryKey;
  if (!query) return { chunks: [], blocks: [], page_count: 1 };

  const queryData: QueryRequest = {
    query,
    mediaTypes: mediaTypes,
    limit,
  }
  const response = await apiClient.search(queryData);

  if (window._paq) {
    const matchCount = response.chunks.length + response.blocks.length
    window._paq.push(['trackSiteSearch',
      queryData.query,
      false,
      matchCount
    ]);
  }

  return response;
};