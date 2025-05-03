import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { apiClient } from "@/lib/api-client";
import { QueryRequest } from "@/types/api";
import { SearchResults, DocumentSearchResults } from "@/types/vectordb";
import { QueryFunction } from "@tanstack/react-query";


export const fetchSIContent: QueryFunction<SearchResults, [string, QueryRequest]> = async ({ queryKey }) => {
  const [_, params] = queryKey;
  if (!params.query) return { chunks: [], blocks: [], page_count: 1 };

  const response = await apiClient.search(params);

  if (window._paq) {
    const matchCount = response.chunks.length + response.blocks.length
    window._paq.push(['trackSiteSearch',
      params.query,
      false,
      matchCount
    ]);
  }

  return response;
};