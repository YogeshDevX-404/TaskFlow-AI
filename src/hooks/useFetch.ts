import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseFetchOptions {
  enabled?: boolean;
}

export function useFetch<T>(
  fetcher: () => Promise<T>,
  dependencies: unknown[] = [],
  options: UseFetchOptions = { enabled: true }
) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(options.enabled ?? true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const errorMsg =
        err instanceof AxiosError && err.response?.data?.message
          ? err.response.data.message
          : err instanceof Error
          ? err.message
          : 'Failed to fetch data';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [fetcher]);

  useEffect(() => {
    if (options.enabled ?? true) {
      refetch();
    }
    // eslint-disable-next-deps
  }, [...dependencies, options.enabled]);

  return { data, isLoading, error, refetch };
}
