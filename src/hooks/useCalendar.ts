import { useEffect } from 'react';
import { useCalendarStore } from '../store/useCalendarStore';
import { CalendarFilters } from '../types/calendar';

export function useCalendar(initialFilters?: Partial<CalendarFilters>) {
  const store = useCalendarStore();

  useEffect(() => {
    store.fetchEvents(initialFilters);
  }, []);

  return store;
}
