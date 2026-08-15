import { create } from 'zustand';
import { CalendarEvent, CalendarFilters, TimelineZoomLevel } from '../types/calendar';
import { calendarService } from '../services/api/calendarService';

interface GanttState {
  events: CalendarEvent[];
  zoomLevel: TimelineZoomLevel;
  showCriticalPath: boolean;
  showDependencies: boolean;
  showBaselines: boolean;
  selectedEventId: string | null;
  isLoading: boolean;
  error: string | null;
  filters: CalendarFilters;

  // Actions
  fetchGanttData: (customFilters?: Partial<CalendarFilters>) => Promise<void>;
  setZoomLevel: (zoom: TimelineZoomLevel) => void;
  setShowCriticalPath: (show: boolean) => void;
  setShowDependencies: (show: boolean) => void;
  setShowBaselines: (show: boolean) => void;
  setSelectedEventId: (id: string | null) => void;
  updateEventDates: (id: string, startDate: string, endDate: string) => Promise<void>;
  setFilters: (filters: Partial<CalendarFilters>) => void;
  resetFilters: () => void;
}

export const useGanttStore = create<GanttState>((set, get) => ({
  events: [],
  zoomLevel: 'month',
  showCriticalPath: false,
  showDependencies: true,
  showBaselines: false,
  selectedEventId: null,
  isLoading: false,
  error: null,
  filters: {},

  fetchGanttData: async (customFilters?: Partial<CalendarFilters>) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { ...get().filters, ...customFilters };
      const events = await calendarService.getEvents(mergedFilters);
      set({ events, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch Gantt data', isLoading: false });
    }
  },

  setZoomLevel: (zoom) => set({ zoomLevel: zoom }),
  setShowCriticalPath: (show) => set({ showCriticalPath: show }),
  setShowDependencies: (show) => set({ showDependencies: show }),
  setShowBaselines: (show) => set({ showBaselines: show }),
  setSelectedEventId: (id) => set({ selectedEventId: id }),

  updateEventDates: async (id: string, startDate: string, endDate: string) => {
    // Optimistic update
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? { ...e, startDate, endDate } : e)),
    }));
    try {
      if (!id.startsWith('task-') && !id.startsWith('sprint-')) {
        await calendarService.updateEvent(id, { startDate, endDate });
      }
    } catch (err: any) {
      // Refresh on failure
      get().fetchGanttData();
    }
  },

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchGanttData();
  },

  resetFilters: () => {
    set({ filters: {} });
    get().fetchGanttData();
  },
}));
