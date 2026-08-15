import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Calendar as CalendarIcon,
  GitBranch,
  Flag,
  Search,
  Plus,
  Filter,
  Layers,
  Sparkles,
  RefreshCw,
  SlidersHorizontal,
} from 'lucide-react';
import { useCalendarStore } from '../../store/useCalendarStore';
import { useTimelineStore } from '../../store/useTimelineStore';
import { useGanttStore } from '../../store/useGanttStore';
import { CalendarView } from './CalendarView';
import { TimelineView } from './TimelineView';
import { GanttChart } from './GanttChart';
import { MilestoneTracker } from './MilestoneTracker';
import { EventModal } from './EventModal';
import { CalendarEvent, CalendarEventFormData } from '../../types/calendar';
import { useProjectStore } from '../../store/useProjectStore';
import { useSprintStore } from '../../store/useSprintStore';

type ActiveTab = 'calendar' | 'timeline' | 'gantt' | 'milestones';

export const CalendarManagementPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('calendar');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<CalendarEvent | null>(null);
  const [modalInitialDate, setModalInitialDate] = useState<Date | undefined>(undefined);

  const { projects } = useProjectStore();
  const { sprints } = useSprintStore();

  const calendarStore = useCalendarStore();
  const timelineStore = useTimelineStore();
  const ganttStore = useGanttStore();

  const [projectIdFilter, setProjectIdFilter] = useState<string>('');
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    calendarStore.fetchEvents();
    timelineStore.fetchTimelineData();
    ganttStore.fetchGanttData();
  }, []);

  const handleApplyFilters = () => {
    const f = {
      projectId: projectIdFilter || undefined,
      eventType: eventTypeFilter as any,
      priority: priorityFilter as any,
      searchQuery: searchQuery || undefined,
    };
    calendarStore.setFilters(f);
    timelineStore.setFilters(f);
    ganttStore.setFilters(f);
  };

  const handleResetFilters = () => {
    setProjectIdFilter('');
    setEventTypeFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    calendarStore.resetFilters();
    timelineStore.resetFilters();
    ganttStore.resetFilters();
  };

  const handleOpenCreateModal = (date?: Date) => {
    setSelectedEventToEdit(null);
    setModalInitialDate(date);
    setIsModalOpen(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEventToEdit(event);
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (formData: CalendarEventFormData) => {
    if (selectedEventToEdit) {
      await calendarStore.updateEvent(selectedEventToEdit.id, formData);
    } else {
      await calendarStore.createEvent(formData);
    }
    timelineStore.fetchTimelineData();
    ganttStore.fetchGanttData();
  };

  const handleDeleteEvent = async (id: string) => {
    await calendarStore.deleteEvent(id);
    timelineStore.fetchTimelineData();
    ganttStore.fetchGanttData();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              Enterprise Module
            </span>
            <span className="text-xs text-slate-400">• Real-time Sync</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Calendar, Timeline & Gantt Roadmap
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize project milestones, sprint schedules, dependencies, and delivery roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Event / Milestone
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search events or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Project */}
          <div>
            <select
              value={projectIdFilter}
              onChange={(e) => setProjectIdFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Event Type */}
          <div>
            <select
              value={eventTypeFilter}
              onChange={(e) => setEventTypeFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Event Types</option>
              <option value="Milestone">Milestone</option>
              <option value="Release">Release</option>
              <option value="Meeting">Meeting</option>
              <option value="Deadline">Deadline</option>
              <option value="Task">Task</option>
              <option value="Sprint">Sprint</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Urgent">Urgent</option>
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleApplyFilters}
              className="flex-1 py-2 px-3 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" />
              Apply
            </button>
            <button
              onClick={handleResetFilters}
              className="p-2 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium"
              title="Reset Filters"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('calendar')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'calendar'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <CalendarIcon className="w-4 h-4" />
          Calendar
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'timeline'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Layers className="w-4 h-4" />
          Timeline / Roadmap
        </button>

        <button
          onClick={() => setActiveTab('gantt')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'gantt'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <GitBranch className="w-4 h-4" />
          Gantt Chart
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`pb-3 px-4 text-sm font-semibold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'milestones'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
          }`}
        >
          <Flag className="w-4 h-4" />
          Milestones & Releases
        </button>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        {activeTab === 'calendar' && (
          <CalendarView
            onOpenCreateModal={handleOpenCreateModal}
            onSelectEvent={handleSelectEvent}
          />
        )}

        {activeTab === 'timeline' && (
          <TimelineView
            onSelectEvent={handleSelectEvent}
            onOpenCreateModal={() => handleOpenCreateModal()}
          />
        )}

        {activeTab === 'gantt' && (
          <GanttChart
            onSelectEvent={handleSelectEvent}
            onOpenCreateModal={() => handleOpenCreateModal()}
          />
        )}

        {activeTab === 'milestones' && (
          <MilestoneTracker
            events={calendarStore.events}
            onSelectEvent={handleSelectEvent}
            onOpenCreateModal={() => handleOpenCreateModal()}
          />
        )}
      </motion.div>

      {/* Event Modal */}
      <EventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventToEdit={selectedEventToEdit}
        initialDate={modalInitialDate}
        onSave={handleSaveEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};
