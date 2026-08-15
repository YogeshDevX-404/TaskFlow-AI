import React from 'react';
import { WorkAssignment } from '../../types/workAssignment';
import { useWorkAssignmentStore } from '../../store/useWorkAssignmentStore';
import {
  ListTodo,
  AlertTriangle,
  FileCheck2,
  RotateCcw,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface MetricsBarProps {
  assignments: WorkAssignment[];
}

export const WorkAssignmentMetricsBar: React.FC<MetricsBarProps> = ({ assignments }) => {
  const { filters, setStatusFilter, setIsOverdueFilter } = useWorkAssignmentStore();

  const activeCount = assignments.filter((a) =>
    ['Assigned', 'Acknowledged', 'In Progress'].includes(a.status)
  ).length;

  const overdueCount = assignments.filter((a) => a.isOverdue && a.status !== 'Completed' && a.status !== 'Cancelled').length;

  const submittedCount = assignments.filter((a) => a.status === 'Submitted').length;

  const changesRequestedCount = assignments.filter((a) => a.status === 'Changes Requested').length;

  const completedCount = assignments.filter((a) => a.status === 'Completed').length;

  const totalEstimatedHours = assignments.reduce(
    (sum, a) => sum + (a.estimatedHours || 0) + (a.estimatedMinutes ? a.estimatedMinutes / 60 : 0),
    0
  );

  const totalLoggedHours = assignments.reduce(
    (sum, a) => sum + ((a.totalLoggedSeconds || 0) / 3600),
    0
  );

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Active Assignments */}
      <button
        onClick={() => {
          setIsOverdueFilter(false);
          setStatusFilter('In Progress');
        }}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filters.status === 'In Progress' && !filters.isOverdue
            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
          <span>Active Work</span>
          <ListTodo className="w-4 h-4 text-amber-500" />
        </div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">
          {activeCount}
        </div>
      </button>

      {/* Overdue */}
      <button
        onClick={() => {
          setStatusFilter('all');
          setIsOverdueFilter(true);
        }}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filters.isOverdue
            ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-rose-600 dark:text-rose-400 font-semibold mb-1">
          <span>Overdue</span>
          <AlertTriangle className="w-4 h-4 text-rose-500" />
        </div>
        <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
          {overdueCount}
        </div>
      </button>

      {/* Submitted / Pending Review */}
      <button
        onClick={() => {
          setIsOverdueFilter(false);
          setStatusFilter('Submitted');
        }}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filters.status === 'Submitted'
            ? 'bg-purple-50 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-purple-600 dark:text-purple-400 font-medium mb-1">
          <span>In Review</span>
          <FileCheck2 className="w-4 h-4 text-purple-500" />
        </div>
        <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
          {submittedCount}
        </div>
      </button>

      {/* Changes Requested */}
      <button
        onClick={() => {
          setIsOverdueFilter(false);
          setStatusFilter('Changes Requested');
        }}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filters.status === 'Changes Requested'
            ? 'bg-orange-50 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-orange-600 dark:text-orange-400 font-medium mb-1">
          <span>Revisions</span>
          <RotateCcw className="w-4 h-4 text-orange-500" />
        </div>
        <div className="text-2xl font-bold text-orange-600 dark:text-orange-300">
          {changesRequestedCount}
        </div>
      </button>

      {/* Completed */}
      <button
        onClick={() => {
          setIsOverdueFilter(false);
          setStatusFilter('Completed');
        }}
        className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
          filters.status === 'Completed'
            ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700 shadow-sm'
            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium mb-1">
          <span>Completed</span>
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
        </div>
        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
          {completedCount}
        </div>
      </button>

      {/* Hours Logged vs Estimated */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
          <span>Hours (Log / Est)</span>
          <Clock className="w-4 h-4 text-indigo-500" />
        </div>
        <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
          {totalLoggedHours.toFixed(1)}h{' '}
          <span className="text-xs text-slate-400 font-normal">
            / {totalEstimatedHours.toFixed(1)}h
          </span>
        </div>
      </div>
    </div>
  );
};
