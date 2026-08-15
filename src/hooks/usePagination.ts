import { useState, useCallback } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = useState<number>(options.initialPage || 1);
  const [limit, setLimit] = useState<number>(options.initialLimit || 10);
  const [totalItems, setTotalItems] = useState<number>(0);

  const totalPages = Math.ceil(totalItems / limit) || 1;

  const goToNextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const goToPrevPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const resetPagination = useCallback(() => {
    setPage(1);
  }, []);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    setPage,
    setLimit,
    setTotalItems,
    goToNextPage,
    goToPrevPage,
    resetPagination,
  };
}
