import { create } from 'zustand';
import { TimelineZoomLevel, CalendarEvent, CalendarFilters } from '../types/calendar';
import { calendarService } from '../services/api/calendarService';

export type TimelineGroupBy = 'project' | 'sprint' | 'status' | 'assignee' | 'eventType';

interface TimelineState {
  events: CalendarEvent[];
  zoomLevel: TimelineZoomLevel;
  groupBy: TimelineGroupBy;
  startDate: Date;
  endDate: Date;
  isLoading: boolean;
  error: string | null;
  filters: CalendarFilters;

  // Actions
  fetchTimelineData: (customFilters?: Partial<CalendarFilters>) => Promise<void>;
  setZoomLevel: (zoom: TimelineZoomLevel) => void;
  setGroupBy: (group: TimelineGroupBy) => void;
  setDateRange: (start: Date, end: Date) => void;
  setFilters: (filters: Partial<CalendarFilters>) => void;
  resetFilters: () => void;
}

const getDefaultDates = () => {
  const start = new Date();
  start.setMonth(start.getMonth() - 1);
  const end = new Date();
  end.setMonth(end.getMonth() + 3);
  return { start, end };
};

const defaultDates = getDefaultDates();

export const useTimelineStore = create<TimelineState>((set, get) => ({
  events: [],
  zoomLevel: 'month',
  groupBy: 'project',
  startDate: defaultDates.start,
  endDate: defaultDates.end,
  isLoading: false,
  error: null,
  filters: {},

  fetchTimelineData: async (customFilters?: Partial<CalendarFilters>) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { ...get().filters, ...customFilters };
      const events = await calendarService.getEvents(mergedFilters);
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch timeline data', isLoading: false });
    }
  },

  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  setGroupBy: (group) => set({ groupBy: group }),
  setDateRange: (start, end) => set({ startDate: start, endDate: end }),

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchTimelineData();
  },

  resetFilters: () => {
    set({ filters: {} });
    get().fetchTimelineData();
  },
}));
