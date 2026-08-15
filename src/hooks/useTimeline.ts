import { useEffect } from 'react';
import { useTimelineStore } from '../store/useTimelineStore';
import { CalendarFilters } from '../types/calendar';

export function useTimeline(initialFilters?: Partial<CalendarFilters>) {
  const store = useTimelineStore();

  useEffect(() => {
    store.fetchTimelineData(initialFilters);
  }, []);

  return store;
}
