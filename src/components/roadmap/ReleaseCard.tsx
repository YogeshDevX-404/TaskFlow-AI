import React from 'react';
import { motion } from 'motion/react';
import {
  Rocket,
  CheckCircle2,
  Clock,
  Flag,
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  Edit,
  Bug,
  AlertCircle,
  Tag,
  ArrowRight,
} from 'lucide-react';
import { Release } from '../../types/release';
import { format, parseISO, isPast } from 'date-fns';

interface ReleaseCardProps {
  release: Release;
  onEdit: (release: Release) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string, isArchived: boolean) => void;
  onDelete: (id: string) => void;
}

export const ReleaseCard: React.FC<ReleaseCardProps> = ({
  release,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);

  const getStatusBadgeClass = (status: Release['status']) => {
    switch (status) {
      case 'Released':
      case 'Ready':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800';
      case 'In Development':
      case 'Testing':
        return 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 border-blue-200 dark:border-blue-800';
      case 'Scheduled':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800';
      case 'Planning':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-800';
      default:
        return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  };

  const projectObj = typeof release.project === 'object' ? release.project : null;
  const projectName = projectObj?.name || 'Global Platform';
  const releaseDateStr = release.releaseDate
    ? format(parseISO(release.releaseDate), 'MMM d, yyyy')
    : 'Unscheduled';

  const isOverdue =
    release.releaseDate &&
    isPast(parseISO(release.releaseDate)) &&
    release.status !== 'Released' &&
    release.status !== 'Archived';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 relative group"
    >
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span
              className="px-2.5 py-0.5 rounded-full text-2xs font-bold uppercase tracking-wide border"
              style={{
                backgroundColor: `${release.color || '#6366f1'}15`,
                color: release.color || '#6366f1',
                borderColor: `${release.color || '#6366f1'}40`,
              }}
            >
              v{release.version}
            </span>
            <span className={`px-2 py-0.5 rounded-md text-2xs font-semibold border ${getStatusBadgeClass(release.status)}`}>
              {release.status}
            </span>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 mt-1 w-40 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-30 text-xs"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(release);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Release
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDuplicate(release.id);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <Copy className="w-3.5 h-3.5" /> Duplicate
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onArchive(release.id, !release.isArchived);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-2"
                >
                  <Archive className="w-3.5 h-3.5" /> {release.isArchived ? 'Restore' : 'Archive'}
                </button>
                <button
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(release.id);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-rose-50 dark:hover:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Release Name & Project */}
        <h3
          onClick={() => onEdit(release)}
          className="text-base font-extrabold text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer line-clamp-1 transition-colors"
        >
          {release.name}
        </h3>
        <p className="text-2xs font-semibold text-slate-400 mt-0.5">{projectName}</p>

        {release.description && (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
            {release.description}
          </p>
        )}
      </div>

      {/* Progress & Milestones Info */}
      <div className="space-y-3 pt-2">
        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-2xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
            <span>Progress ({release.completedTasks}/{release.totalTasks} tasks)</span>
            <span>{release.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${release.progress}%`,
                backgroundColor: release.color || '#6366f1',
              }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-between text-2xs font-medium text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2.5">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Flag className="w-3 h-3 text-indigo-500" />
              {release.milestones?.length || 0} Milestones
            </span>
            {release.openBugs > 0 && (
              <span className="flex items-center gap-1 text-rose-500 font-bold">
                <Bug className="w-3 h-3" />
                {release.openBugs} Bugs
              </span>
            )}
          </div>

          <div
            className={`flex items-center gap-1 font-semibold ${
              isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-300'
            }`}
          >
            <Clock className="w-3 h-3" />
            {releaseDateStr}
            {isOverdue && <AlertCircle className="w-3 h-3 text-rose-500" title="Overdue release" />}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
