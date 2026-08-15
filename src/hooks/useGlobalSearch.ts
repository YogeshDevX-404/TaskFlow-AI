import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  searchService,
  SearchFilterParams,
  SearchResponseData,
  SearchSuggestion,
  RecentSearchItem,
} from '../services/api/searchService';

/**
 * Main Enterprise Search Hook with TanStack Query
 */
export function useGlobalSearch(params: SearchFilterParams, enabled = true) {
  return useQuery<SearchResponseData>({
    queryKey: ['globalSearch', params],
    queryFn: () => searchService.search(params),
    enabled: enabled && (Boolean(params.query) || Boolean(params.q) || Boolean(params.category) || params.category !== 'all'),
    staleTime: 1000 * 30, // 30 seconds
    keepPreviousData: true,
  } as any);
}

/**
 * Typeahead Search Suggestions Hook
 */
export function useSearchSuggestions(query: string, enabled = true) {
  return useQuery<SearchSuggestion[]>({
    queryKey: ['searchSuggestions', query],
    queryFn: () => searchService.getSuggestions(query),
    enabled: enabled && Boolean(query) && query.trim().length >= 1,
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Recent Searches Hook
 */
export function useRecentSearches() {
  return useQuery<RecentSearchItem[]>({
    queryKey: ['recentSearches'],
    queryFn: () => searchService.getRecentSearches(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Save Recent Search Mutation
 */
export function useSaveRecentSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ query, category, filters }: { query: string; category?: string; filters?: Record<string, any> }) =>
      searchService.saveRecentSearch(query, category, filters),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    },
  });
}

/**
 * Clear Recent Searches Mutation
 */
export function useClearRecentSearches() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id?: string) => searchService.clearRecentSearches(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recentSearches'] });
    },
  });
}
