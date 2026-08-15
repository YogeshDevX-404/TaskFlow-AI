import React from 'react';
import { motion } from 'motion/react';
import {
  Flag,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingUp,
  Tag,
  Folder,
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { CalendarEvent } from '../../types/calendar';

interface MilestoneTrackerProps {
  events?: CalendarEvent[];
  onSelectEvent?: (event: CalendarEvent) => void;
  onOpenCreateModal?: () => void;
}

export const MilestoneTracker: React.FC<MilestoneTrackerProps> = ({
  events = [],
  onSelectEvent,
  onOpenCreateModal,
}) => {
  const milestones = events.filter((e) => e.isMilestone || e.eventType === 'Milestone' || e.eventType === 'Release');

  const totalMilestones = milestones.length;
  const completed = milestones.filter((m) => m.status === 'Completed').length;
  const inProgress = milestones.filter((m) => m.status === 'In Progress').length;
  const delayed = milestones.filter((m) => m.status === 'Delayed' || (isPast(new Date(m.endDate)) && m.status !== 'Completed')).length;

  const completionRate = totalMilestones > 0 ? Math.round((completed / totalMilestones) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Milestones
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Flag className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {totalMilestones}
          </div>
          <div className="text-xs text-slate-500 mt-1">Key release & architectural targets</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Completion Rate
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {completionRate}%
          </div>
          <div className="text-xs text-slate-500 mt-1">{completed} of {totalMilestones} delivered</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Deliveries
            </span>
            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {inProgress}
          </div>
          <div className="text-xs text-slate-500 mt-1">Currently in execution</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              At Risk / Delayed
            </span>
            <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">
            {delayed}
          </div>
          <div className="text-xs text-slate-500 mt-1">Requires focus or timeline shift</div>
        </div>
      </div>

      {/* Header & Add Button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <Flag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          Enterprise Milestones & Releases
        </h3>
        <button
          onClick={onOpenCreateModal}
          className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          New Milestone
        </button>
      </div>

      {/* Milestone Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {milestones.map((milestone) => (
          <motion.div
            key={milestone.id}
            whileHover={{ y: -2 }}
            onClick={() => onSelectEvent(milestone)}
            className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider"
                  style={{
                    backgroundColor: `${milestone.color || '#6366f1'}20`,
                    color: milestone.color || '#6366f1',
                  }}
                >
                  {milestone.eventType}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-medium ${
                    milestone.status === 'Completed'
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                      : milestone.status === 'In Progress'
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {milestone.status}
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                {milestone.title}
              </h4>

              {milestone.description && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                  {milestone.description}
                </p>
              )}
            </div>

            <div className="space-y-3">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  <span>Progress</span>
                  <span>{milestone.progress || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${milestone.progress || 0}%`,
                      backgroundColor: milestone.color || '#6366f1',
                    }}
                  />
                </div>
              </div>

              {/* Target Date */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="flex items-center gap-1 font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Target: {format(new Date(milestone.endDate), 'MMM d, yyyy')}
                </span>

                <span className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
