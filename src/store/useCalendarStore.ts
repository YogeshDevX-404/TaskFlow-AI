import { create } from 'zustand';
import {
  CalendarEvent,
  CalendarFilters,
  CalendarEventFormData,
  CalendarViewMode,
} from '../types/calendar';
import { calendarService } from '../services/api/calendarService';

interface CalendarState {
  events: CalendarEvent[];
  selectedEvent: CalendarEvent | null;
  selectedDate: Date;
  viewMode: CalendarViewMode;
  isLoading: boolean;
  error: string | null;
  filters: CalendarFilters;

  // Actions
  fetchEvents: (customFilters?: Partial<CalendarFilters>) => Promise<void>;
  createEvent: (data: CalendarEventFormData) => Promise<CalendarEvent>;
  updateEvent: (id: string, data: Partial<CalendarEventFormData>) => Promise<CalendarEvent>;
  deleteEvent: (id: string) => Promise<void>;
  setSelectedEvent: (event: CalendarEvent | null) => void;
  setSelectedDate: (date: Date) => void;
  setViewMode: (mode: CalendarViewMode) => void;
  setFilters: (filters: Partial<CalendarFilters>) => void;
  resetFilters: () => void;
}

const initialFilters: CalendarFilters = {
  projectId: undefined,
  sprintId: undefined,
  eventType: 'all',
  status: 'all',
  priority: 'all',
  searchQuery: '',
};

export const useCalendarStore = create<CalendarState>((set, get) => ({
  events: [],
  selectedEvent: null,
  selectedDate: new Date(),
  viewMode: 'month',
  isLoading: false,
  error: null,
  filters: initialFilters,

  fetchEvents: async (customFilters?: Partial<CalendarFilters>) => {
    set({ isLoading: true, error: null });
    try {
      const mergedFilters = { ...get().filters, ...customFilters };
      const events = await calendarService.getEvents(mergedFilters);
      set({ events, isLoading: false });
    } catch (err: any) {
      set({
        error: err.message || 'Failed to fetch calendar events',
        isLoading: false,
      });
    }
  },

  createEvent: async (data: CalendarEventFormData) => {
    set({ isLoading: true, error: null });
    try {
      const created = await calendarService.createEvent(data);
      set((state) => ({
        events: [created, ...state.events],
        isLoading: false,
      }));
      return created;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create event', isLoading: false });
      throw err;
    }
  },

  updateEvent: async (id: string, data: Partial<CalendarEventFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await calendarService.updateEvent(id, data);
      set((state) => ({
        events: state.events.map((e) => (e.id === id ? updated : e)),
        selectedEvent: state.selectedEvent?.id === id ? updated : state.selectedEvent,
        isLoading: false,
      }));
      return updated;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update event', isLoading: false });
      throw err;
    }
  },

  deleteEvent: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await calendarService.deleteEvent(id);
      set((state) => ({
        events: state.events.filter((e) => e.id !== id),
        selectedEvent: state.selectedEvent?.id === id ? null : state.selectedEvent,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete event', isLoading: false });
      throw err;
    }
  },

  setSelectedEvent: (event) => set({ selectedEvent: event }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setViewMode: (mode) => set({ viewMode: mode }),

  setFilters: (newFilters) => {
    set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    get().fetchEvents();
  },

  resetFilters: () => {
    set({ filters: initialFilters });
    get().fetchEvents();
  },
}));
