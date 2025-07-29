import { NEXT_PUBLIC_SERVER_URL } from "@/config";
import { apiClient } from "@/lib/api-client";
import { QueryRequest } from "@/types/api";
import { SearchResults, DocumentSearchResults } from "@/types/vectordb";
import { QueryFunction } from "@tanstack/react-query";


export const fetchSIContent: QueryFunction<SearchResults, [string, QueryRequest]> = async ({ queryKey }) => {
  const [_, params] = queryKey;
  if (!params.query) return { chunks: [], blocks: [], page_count: 1 };

  const response = await apiClient.search(params);

  // Removed tracking logic from here - it should be handled separately
  // to avoid duplicate tracking when React Query refetches

  return response;
};