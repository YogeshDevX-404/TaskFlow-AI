import { DEFAULT_PAGINATION } from '../constants';
import { PaginationMeta, QueryOptions } from '../types';

export function parseQueryOptions(query: Record<string, unknown>): QueryOptions {
  const page = Math.max(1, parseInt(String(query.page || DEFAULT_PAGINATION.PAGE), 10));
  const limit = Math.min(
    DEFAULT_PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(String(query.limit || DEFAULT_PAGINATION.LIMIT), 10))
  );
  const sortBy = String(query.sortBy || DEFAULT_PAGINATION.SORT_BY);
  const sortOrder = (query.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc';
  const search = query.search ? String(query.search).trim() : undefined;

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
  };
}

export function calculatePaginationMeta(
  totalItems: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit) || 1;
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function buildSearchFilter(
  searchQuery?: string,
  searchFields: string[] = ['name', 'title', 'description']
): Record<string, unknown> {
  if (!searchQuery || searchFields.length === 0) return {};

  const regex = new RegExp(searchQuery, 'i');
  return {
    $or: searchFields.map((field) => ({ [field]: regex })),
  };
}
