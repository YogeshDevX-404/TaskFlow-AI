import { useEffect } from 'react';
import { useGanttStore } from '../store/useGanttStore';
import { CalendarFilters } from '../types/calendar';

export function useGantt(initialFilters?: Partial<CalendarFilters>) {
  const store = useGanttStore();

  useEffect(() => {
    store.fetchGanttData(initialFilters);
  }, []);

  return store;
}
