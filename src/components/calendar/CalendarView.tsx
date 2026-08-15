import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Plus,
  Filter,
  Search,
  Grid,
  List,
  Clock,
  Flag,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
  addWeeks,
  subWeeks,
} from 'date-fns';
import { useCalendarStore } from '../../store/useCalendarStore';
import { CalendarEvent, CalendarViewMode, CalendarEventType } from '../../types/calendar';

interface CalendarViewProps {
  onOpenCreateModal: (date?: Date) => void;
  onSelectEvent: (event: CalendarEvent) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenCreateModal,
  onSelectEvent,
}) => {
  const {
    events,
    selectedDate,
    setSelectedDate,
    viewMode,
    setViewMode,
    isLoading,
  } = useCalendarStore();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setSelectedDate(subMonths(selectedDate, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(subWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, -1));
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setSelectedDate(addMonths(selectedDate, 1));
    } else if (viewMode === 'week') {
      setSelectedDate(addWeeks(selectedDate, 1));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Render Month Grid
  const renderMonthGrid = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    const days = [];
    let day = startDate;

    while (day <= endDate) {
      days.push(day);
      day = addDays(day, 1);
    }

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {/* Days Header */}
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          {weekDays.map((d) => (
            <div
              key={d}
              className="py-2.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-slate-200 dark:divide-slate-800">
          {days.map((dayItem, idx) => {
            const dayEvents = events.filter((e) => {
              const start = new Date(e.startDate);
              return isSameDay(start, dayItem);
            });

            const isCurrentMonth = isSameMonth(dayItem, monthStart);
            const isDayToday = isToday(dayItem);

            return (
              <div
                key={idx}
                onClick={() => onOpenCreateModal(dayItem)}
                className={`min-h-[120px] p-1.5 transition-colors cursor-pointer group hover:bg-indigo-50/40 dark:hover:bg-indigo-950/20 ${
                  !isCurrentMonth ? 'bg-slate-50/50 dark:bg-slate-950/30 text-slate-400 dark:text-slate-600' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full ${
                      isDayToday
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : isCurrentMonth
                        ? 'text-slate-700 dark:text-slate-300'
                        : 'text-slate-400 dark:text-slate-600'
                    }`}
                  >
                    {format(dayItem, 'd')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenCreateModal(dayItem);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-opacity"
                    title="Add Event"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Event list */}
                <div className="space-y-1 max-h-[90px] overflow-y-auto custom-scrollbar">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectEvent(event);
                      }}
                      className="px-2 py-1 rounded-md text-xs font-medium truncate flex items-center gap-1.5 shadow-2xs hover:brightness-95 transition-all cursor-pointer border border-black/5"
                      style={{
                        backgroundColor: `${event.color || '#6366f1'}20`,
                        color: event.color || '#6366f1',
                        borderLeft: `3px solid ${event.color || '#6366f1'}`,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: event.color || '#6366f1' }}
                      />
                      <span className="truncate">{event.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Week Grid
  const renderWeekGrid = () => {
    const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          {weekDays.map((dayItem) => (
            <div key={dayItem.toString()} className="py-3 text-center">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                {format(dayItem, 'EEE')}
              </div>
              <div
                className={`text-sm font-bold mt-0.5 inline-block px-2 py-0.5 rounded-full ${
                  isToday(dayItem)
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-800 dark:text-slate-200'
                }`}
              >
                {format(dayItem, 'MMM d')}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 min-h-[500px] divide-x divide-slate-200 dark:divide-slate-800">
          {weekDays.map((dayItem) => {
            const dayEvents = events.filter((e) => isSameDay(new Date(e.startDate), dayItem));
            return (
              <div
                key={dayItem.toString()}
                onClick={() => onOpenCreateModal(dayItem)}
                className="p-2 space-y-2 hover:bg-slate-50/60 dark:hover:bg-slate-800/20 cursor-pointer"
              >
                {dayEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEvent(event);
                    }}
                    className="p-2 rounded-lg text-xs font-medium shadow-xs border transition-all cursor-pointer hover:shadow-md"
                    style={{
                      backgroundColor: `${event.color || '#6366f1'}15`,
                      color: event.color || '#6366f1',
                      borderColor: `${event.color || '#6366f1'}40`,
                    }}
                  >
                    <div className="font-semibold text-slate-900 dark:text-slate-100 truncate mb-1">
                      {event.title}
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{format(new Date(event.startDate), 'HH:mm')}</span>
                      <span className="px-1.5 py-0.5 rounded-xs bg-slate-100 dark:bg-slate-800 font-semibold">
                        {event.eventType}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render Agenda View
  const renderAgendaView = () => {
    const sortedEvents = [...events].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );

    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden divide-y divide-slate-200 dark:divide-slate-800">
        {sortedEvents.length === 0 ? (
          <div className="p-12 text-center text-slate-500 dark:text-slate-400">
            <CalendarIcon className="w-12 h-12 mx-auto mb-3 opacity-40 text-slate-400" />
            <p className="text-base font-medium">No scheduled events or milestones</p>
            <p className="text-xs mt-1 text-slate-400">Click "New Event" to add key project milestones or meetings.</p>
          </div>
        ) : (
          sortedEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => onSelectEvent(event)}
              className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="w-3 h-10 rounded-full shrink-0"
                  style={{ backgroundColor: event.color || '#6366f1' }}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                      {event.title}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase"
                      style={{
                        backgroundColor: `${event.color || '#6366f1'}20`,
                        color: event.color || '#6366f1',
                      }}
                    >
                      {event.eventType}
                    </span>
                  </div>
                  {event.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {format(new Date(event.startDate), 'MMM d, yyyy HH:mm')} -{' '}
                      {format(new Date(event.endDate), 'HH:mm')}
                    </span>
                    {event.priority && (
                      <span className="flex items-center gap-1">
                        <Flag className="w-3.5 h-3.5" />
                        {event.priority} Priority
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold ${
                    event.status === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : event.status === 'In Progress'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* View Header & Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-3">
          <button
            onClick={handleToday}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Today
          </button>

          <div className="flex items-center gap-1 border border-slate-300 dark:border-slate-700 rounded-lg p-0.5">
            <button
              onClick={handlePrev}
              className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
        </div>

        {/* View Mode Toggle & Add Button */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
            {(['month', 'week', 'agenda'] as CalendarViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                  viewMode === mode
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <button
            onClick={() => onOpenCreateModal()}
            className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            New Event
          </button>
        </div>
      </div>

      {/* Main Grid View */}
      {viewMode === 'month' && renderMonthGrid()}
      {viewMode === 'week' && renderWeekGrid()}
      {viewMode === 'agenda' && renderAgendaView()}
    </div>
  );
};
