import React, { useState } from 'react';
import { IAttentionNeededAssignment } from '../../../types/workAssignment';
import {
  ShieldAlert,
  Flame,
  Clock,
  RotateCcw,
  Search,
  User,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

interface AttentionNeededViewProps {
  attentionList: IAttentionNeededAssignment[];
  onSelectAssignment: (assignmentId: string) => void;
  onReassign: (assignmentId: string) => void;
}

export const AttentionNeededView: React.FC<AttentionNeededViewProps> = ({
  attentionList,
  onSelectAssignment,
  onReassign,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'high' | 'medium'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = attentionList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.assignedTo?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.blockedReason && item.blockedReason.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesFilter = filterType === 'all' || item.urgency === filterType;
    return matchesSearch && matchesFilter;
  });

  const getUrgencyBadge = (urgency: 'critical' | 'high' | 'medium') => {
    switch (urgency) {
      case 'critical':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-500" />
            CRITICAL
          </span>
        );
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            HIGH
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 flex items-center gap-1">
            <Clock className="w-3 h-3 text-sky-500" />
            DUE SOON
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search overdue, blocked, or urgent tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 text-slate-900 dark:text-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['all', 'critical', 'high', 'medium'] as const).map((tier) => (
            <button
              key={tier}
              onClick={() => setFilterType(tier)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition-colors cursor-pointer shrink-0 ${
                filterType === tier
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {tier === 'all' ? 'All Urgent Items' : tier}
            </button>
          ))}
        </div>
      </div>

      {/* Attention Items Grid / List */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Blockers or Overdue Work</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            All active assignments are progressing smoothly on schedule without any reported blockers.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border p-5 shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                item.urgency === 'critical'
                  ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  : item.urgency === 'high'
                  ? 'border-amber-200 dark:border-amber-900/60'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-2 flex-1">
                {/* Meta Header */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {item.assignmentId}
                  </span>
                  {getUrgencyBadge(item.urgency)}
                  <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                    {item.attentionReason}
                  </span>
                </div>

                {/* Title */}
                <div>
                  <h4
                    onClick={() => onSelectAssignment(item.id)}
                    className="text-base font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer transition-colors"
                  >
                    {item.title}
                  </h4>
                  {item.project && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Project: {item.project.name}
                    </span>
                  )}
                </div>

                {/* Blocked Reason or Overdue Note */}
                {item.status === 'Blocked' && item.blockedReason && (
                  <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 rounded-xl text-xs text-rose-800 dark:text-rose-200">
                    <strong className="font-semibold block mb-0.5">Developer Blocker Note:</strong>
                    <span>{item.blockedReason}</span>
                  </div>
                )}

                {/* Developer Info & Progress */}
                <div className="flex flex-wrap items-center gap-4 text-xs pt-1 text-slate-600 dark:text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Assigned:</span>
                    <strong className="text-slate-800 dark:text-slate-200 font-medium">
                      {item.assignedTo?.name || 'Unassigned'}
                    </strong>
                  </div>

                  {item.dueDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Due:</span>
                      <strong className={item.isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800 dark:text-slate-200'}>
                        {new Date(item.dueDate).toLocaleDateString()}
                      </strong>
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span>Progress:</span>
                    <div className="w-20 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <strong className="text-slate-800 dark:text-slate-200">{item.progress}%</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex sm:flex-col items-center gap-2 w-full sm:w-auto shrink-0">
                <button
                  onClick={() => onSelectAssignment(item.id)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
                >
                  <span>Resolve / Assist</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => onReassign(item.id)}
                  className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer whitespace-nowrap flex items-center justify-center gap-1.5"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Reassign</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
