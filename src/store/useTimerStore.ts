import { create } from 'zustand';
import { TimeEntry } from '../types/timeEntry';

interface TimerStoreState {
  activeTimer: TimeEntry | null;
  secondsElapsed: number;
  conflictTimer: TimeEntry | null;
  isConflictModalOpen: boolean;
  pendingStartData: {
    taskId?: string;
    projectId?: string;
    workspaceId?: string;
    organizationId?: string;
    description?: string;
    isBillable?: boolean;
    billableRate?: number;
  } | null;

  // Actions
  setActiveTimer: (timer: TimeEntry | null) => void;
  updateActiveTimerState: (updates: Partial<TimeEntry>) => void;
  tick: () => void;
  setConflictModal: (
    conflictTimer: TimeEntry,
    pendingData: {
      taskId?: string;
      projectId?: string;
      workspaceId?: string;
      organizationId?: string;
      description?: string;
      isBillable?: boolean;
      billableRate?: number;
    }
  ) => void;
  closeConflictModal: () => void;
  clearTimer: () => void;
}

export const useTimerStore = create<TimerStoreState>((set, get) => ({
  activeTimer: null,
  secondsElapsed: 0,
  conflictTimer: null,
  isConflictModalOpen: false,
  pendingStartData: null,

  setActiveTimer: (timer) => {
    if (!timer) {
      set({ activeTimer: null, secondsElapsed: 0 });
      return;
    }

    let initialElapsed = timer.accumulatedTime || 0;
    if (timer.status === 'running' && timer.startTime) {
      const now = new Date().getTime();
      const start = new Date(timer.startTime).getTime();
      const diffInSeconds = Math.max(0, Math.floor((now - start) / 1000));
      initialElapsed += diffInSeconds;
    }

    set({
      activeTimer: timer,
      secondsElapsed: initialElapsed,
    });
  },

  updateActiveTimerState: (updates) => {
    const { activeTimer } = get();
    if (!activeTimer) return;
    set({
      activeTimer: { ...activeTimer, ...updates },
    });
  },

  tick: () => {
    const { activeTimer, secondsElapsed } = get();
    if (activeTimer && activeTimer.status === 'running') {
      set({ secondsElapsed: secondsElapsed + 1 });
    }
  },

  setConflictModal: (conflictTimer, pendingData) => {
    set({
      conflictTimer,
      pendingStartData: pendingData,
      isConflictModalOpen: true,
    });
  },

  closeConflictModal: () => {
    set({
      conflictTimer: null,
      pendingStartData: null,
      isConflictModalOpen: false,
    });
  },

  clearTimer: () => {
    set({
      activeTimer: null,
      secondsElapsed: 0,
      conflictTimer: null,
      isConflictModalOpen: false,
      pendingStartData: null,
    });
  },
}));
