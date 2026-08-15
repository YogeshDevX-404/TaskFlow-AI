import React from 'react';
import { Sprint } from '../../types/sprint';
import { SprintCard } from './SprintCard';
import { Play, CheckCircle2, Clock, XCircle, Plus, Zap } from 'lucide-react';

interface SprintBoardViewProps {
  sprints: Sprint[];
  onStartSprint: (sprint: Sprint) => void;
  onCompleteSprint: (sprint: Sprint) => void;
  onCancelSprint: (sprint: Sprint) => void;
  onEditSprint: (sprint: Sprint) => void;
  onDuplicateSprint: (sprint: Sprint) => void;
  onArchiveSprint: (sprint: Sprint) => void;
  onDeleteSprint: (sprint: Sprint) => void;
  onSelectSprint: (sprint: Sprint) => void;
  onCreateSprint: () => void;
}

export const SprintBoardView: React.FC<SprintBoardViewProps> = ({
  sprints,
  onStartSprint,
  onCompleteSprint,
  onCancelSprint,
  onEditSprint,
  onDuplicateSprint,
  onArchiveSprint,
  onDeleteSprint,
  onSelectSprint,
  onCreateSprint,
}) => {
  const activeSprints = sprints.filter((s) => s.status === 'Active' && !s.isArchived);
  const planningSprints = sprints.filter((s) => s.status === 'Planning' && !s.isArchived);
  const completedSprints = sprints.filter(
    (s) => (s.status === 'Completed' || s.status === 'Cancelled') && !s.isArchived
  );

  return (
    <div className="space-y-6">
      {/* Board Column Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Active Sprint Column */}
        <div className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                <Zap className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Active Sprint
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 text-xs font-black">
              {activeSprints.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
            {activeSprints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No active sprint in progress. Select a planning sprint to start execution.
              </div>
            ) : (
              activeSprints.map((s) => (
                <SprintCard
                  key={s.id}
                  sprint={s}
                  onComplete={onCompleteSprint}
                  onCancel={onCancelSprint}
                  onEdit={onEditSprint}
                  onDuplicate={onDuplicateSprint}
                  onArchive={onArchiveSprint}
                  onDelete={onDeleteSprint}
                  onSelect={onSelectSprint}
                />
              ))
            )}
          </div>
        </div>

        {/* Planning / Future Sprints Column */}
        <div className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                <Clock className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Planning & Upcoming
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 text-xs font-black">
                {planningSprints.length}
              </span>
              <button
                onClick={onCreateSprint}
                className="p-1 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-800"
                title="Create Sprint"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
            {planningSprints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No upcoming planning sprints. Create a new sprint to plan next iteration.
              </div>
            ) : (
              planningSprints.map((s) => (
                <SprintCard
                  key={s.id}
                  sprint={s}
                  onStart={onStartSprint}
                  onEdit={onEditSprint}
                  onDuplicate={onDuplicateSprint}
                  onArchive={onArchiveSprint}
                  onDelete={onDeleteSprint}
                  onSelect={onSelectSprint}
                />
              ))
            )}
          </div>
        </div>

        {/* Completed / Cancelled Sprints Column */}
        <div className="bg-slate-100/70 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Completed Sprints
              </h3>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 text-xs font-black">
              {completedSprints.length}
            </span>
          </div>

          <div className="space-y-3 flex-1 overflow-y-auto max-h-[600px]">
            {completedSprints.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                No completed sprints yet.
              </div>
            ) : (
              completedSprints.map((s) => (
                <SprintCard
                  key={s.id}
                  sprint={s}
                  onEdit={onEditSprint}
                  onDuplicate={onDuplicateSprint}
                  onArchive={onArchiveSprint}
                  onDelete={onDeleteSprint}
                  onSelect={onSelectSprint}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
