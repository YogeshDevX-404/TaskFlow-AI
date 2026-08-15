import React from 'react';
import { Release } from '../../types/release';
import { ReleaseCard } from './ReleaseCard';
import { Clock, CheckCircle2, PlayCircle, FolderPlus, Plus } from 'lucide-react';

interface ReleaseBoardViewProps {
  releases: Release[];
  onEditRelease: (release: Release) => void;
  onDuplicateRelease: (id: string) => void;
  onArchiveRelease: (id: string, isArchived: boolean) => void;
  onDeleteRelease: (id: string) => void;
  onOpenCreateModal: () => void;
}

export const ReleaseBoardView: React.FC<ReleaseBoardViewProps> = ({
  releases,
  onEditRelease,
  onDuplicateRelease,
  onArchiveRelease,
  onDeleteRelease,
  onOpenCreateModal,
}) => {
  const upcoming = releases.filter(
    (r) => r.status === 'Planning' || r.status === 'Scheduled'
  );
  const current = releases.filter(
    (r) => r.status === 'In Development' || r.status === 'Testing'
  );
  const completed = releases.filter(
    (r) => r.status === 'Released' || r.status === 'Ready'
  );
  const future = releases.filter(
    (r) => r.status === 'Cancelled' || r.status === 'Archived'
  );

  const columns = [
    {
      id: 'current',
      title: 'Current Release',
      icon: PlayCircle,
      color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
      releases: current,
    },
    {
      id: 'upcoming',
      title: 'Upcoming Releases',
      icon: Clock,
      color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60',
      releases: upcoming,
    },
    {
      id: 'completed',
      title: 'Completed Releases',
      icon: CheckCircle2,
      color: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
      releases: completed,
    },
    {
      id: 'future',
      title: 'Future / Backlog',
      icon: FolderPlus,
      color: 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800',
      releases: future,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 items-start">
        {columns.map((col) => {
          const Icon = col.icon;
          return (
            <div
              key={col.id}
              className="bg-slate-50/70 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col space-y-4 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${col.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100">
                    {col.title}
                  </h3>
                </div>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {col.releases.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="space-y-3.5 flex-1">
                {col.releases.length === 0 ? (
                  <div className="text-center py-12 px-4 text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No releases in this column
                  </div>
                ) : (
                  col.releases.map((release) => (
                    <ReleaseCard
                      key={release.id}
                      release={release}
                      onEdit={onEditRelease}
                      onDuplicate={onDuplicateRelease}
                      onArchive={onArchiveRelease}
                      onDelete={onDeleteRelease}
                    />
                  ))
                )}
              </div>

              {/* Add Button at bottom of column */}
              <button
                onClick={onOpenCreateModal}
                className="w-full py-2 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 text-xs font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Release
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
