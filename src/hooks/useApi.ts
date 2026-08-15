import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
}

export function useApi<T, P extends unknown[]>(
  apiFunc: (...args: P) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: P): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await apiFunc(...args);
        setState({ data: result, isLoading: false, error: null });
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof AxiosError && err.response?.data?.message
            ? err.response.data.message
            : err instanceof Error
            ? err.message
            : 'An unexpected API error occurred.';

        setState((prev) => ({ ...prev, isLoading: false, error: errorMsg }));
        return null;
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setState({ data: null, isLoading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}
