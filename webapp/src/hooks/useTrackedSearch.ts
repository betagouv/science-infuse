import { useEffect, useRef } from 'react';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { push } from '@socialgouv/matomo-next';
import { QueryRequest } from '@/types/api';
import { SearchResults } from '@/types/vectordb';
import { fetchSIContent } from '@/app/(main)/recherche/fetchSIContent';

interface UseTrackedSearchOptions extends Omit<UseQueryOptions<SearchResults, Error, SearchResults, [string, QueryRequest]>, 'queryKey' | 'queryFn'> {
    trackingEnabled?: boolean;
}

export function useTrackedSearch(params: QueryRequest, options?: UseTrackedSearchOptions) {
    const { trackingEnabled = true, ...queryOptions } = options || {};

    // Keep track of the last tracked query to prevent duplicates
    const lastTrackedQuery = useRef<string>('');
    const trackingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Use the standard React Query hook
    const queryResult = useQuery({
        queryKey: ['search', params],
        queryFn: fetchSIContent,
        ...queryOptions,
        enabled: !!params.query && (queryOptions.enabled !== false),
    });

    // Handle search tracking separately
    useEffect(() => {
        // Only track if enabled and we have data
        if (!trackingEnabled || !queryResult.data || !params.query) {
            return;
        }

        // Clear any existing timeout
        if (trackingTimeoutRef.current) {
            clearTimeout(trackingTimeoutRef.current);
        }

        // Debounce the tracking to avoid duplicates
        trackingTimeoutRef.current = setTimeout(() => {
            // Only track if this is a different query than the last one we tracked
            if (params.query !== lastTrackedQuery.current) {
                lastTrackedQuery.current = params.query;

                const matchCount = queryResult.data.chunks.length + queryResult.data.blocks.length;

                push(['trackSiteSearch',
                    params.query,
                    "", // category (empty for now)
                    matchCount
                ]);

                console.log('Matomo: Tracked search for', params.query, 'with', matchCount, 'results');
            }
        }, 500); // 500ms debounce for search tracking

        // Cleanup
        return () => {
            if (trackingTimeoutRef.current) {
                clearTimeout(trackingTimeoutRef.current);
            }
        };
    }, [params.query, queryResult.data, trackingEnabled]);

    return queryResult;
}