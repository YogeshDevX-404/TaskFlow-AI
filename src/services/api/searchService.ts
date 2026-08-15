import { axiosInstance } from './axiosInstance';

export interface SearchFilterParams {
  query?: string;
  q?: string;
  category?: string;
  type?: string;
  organizationId?: string;
  workspaceId?: string;
  projectId?: string;
  status?: string;
  priority?: string;
  assigneeId?: string;
  reporterId?: string;
  taskType?: string;
  labels?: string | string[];
  sprintId?: string;
  releaseId?: string;
  dateFilter?: 'today' | 'yesterday' | '7d' | '30d' | 'this_month' | 'last_month' | 'custom';
  startDate?: string;
  endDate?: string;
  sortBy?: 'relevance' | 'newest' | 'oldest' | 'updated' | 'alphabetical' | 'priority' | 'dueDate';
  page?: number;
  limit?: number;
  saveRecent?: boolean;
}

export interface SearchResultItem {
  id: string;
  title: string;
  type: 'task' | 'project' | 'people' | 'workspace' | 'sprint' | 'release' | 'comment' | 'file' | 'activity' | 'notification' | 'organization';
  category: string;
  identifier?: string;
  description?: string;
  url: string;
  status?: string;
  priority?: string;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  context?: {
    organizationId?: string;
    organizationName?: string;
    workspaceId?: string;
    workspaceName?: string;
    projectId?: string;
    projectName?: string;
  };
  updatedAt: string;
  score?: number;
}

export interface SearchResponseData {
  results: SearchResultItem[];
  countsByCategory: Record<string, number>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  queryParsed: {
    text: string;
    filters: Record<string, any>;
  };
}

export interface SearchSuggestion {
  id: string;
  text: string;
  type: string;
  url: string;
}

export interface RecentSearchItem {
  id: string;
  query: string;
  category: string;
  filters?: Record<string, any>;
  lastSearchedAt: string;
}

class SearchService {
  /**
   * Execute global search
   */
  public async search(params: SearchFilterParams): Promise<SearchResponseData> {
    const response = await axiosInstance.get('/search', { params });
    return response.data.data;
  }

  /**
   * Get search typeahead suggestions
   */
  public async getSuggestions(query: string): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length === 0) return [];
    const response = await axiosInstance.get('/search/suggestions', {
      params: { q: query },
    });
    return response.data.data?.suggestions || [];
  }

  /**
   * Get recent searches
   */
  public async getRecentSearches(): Promise<RecentSearchItem[]> {
    const response = await axiosInstance.get('/search/recent');
    return response.data.data || [];
  }

  /**
   * Save a recent search
   */
  public async saveRecentSearch(
    query: string,
    category = 'all',
    filters = {}
  ): Promise<RecentSearchItem> {
    const response = await axiosInstance.post('/search/recent', {
      query,
      category,
      filters,
    });
    return response.data.data;
  }

  /**
   * Clear single or all recent searches
   */
  public async clearRecentSearches(id?: string): Promise<boolean> {
    await axiosInstance.delete('/search/recent', {
      params: id ? { id } : {},
    });
    return true;
  }
}

export const searchService = new SearchService();
