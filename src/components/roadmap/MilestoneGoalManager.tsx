import React, { useState } from 'react';
import { Flag, Target, Plus, CheckCircle2, Trash2, Clock, AlertCircle } from 'lucide-react';
import { ReleaseMilestone, ReleaseGoal, GoalType, GoalStatus, MilestoneStatus } from '../../types/release';

interface MilestoneGoalManagerProps {
  milestones: ReleaseMilestone[];
  goals: ReleaseGoal[];
  onChangeMilestones: (milestones: ReleaseMilestone[]) => void;
  onChangeGoals: (goals: ReleaseGoal[]) => void;
}

export const MilestoneGoalManager: React.FC<MilestoneGoalManagerProps> = ({
  milestones,
  goals,
  onChangeMilestones,
  onChangeGoals,
}) => {
  const [activeTab, setActiveTab] = useState<'milestones' | 'goals'>('milestones');

  // Milestone Form
  const [mTitle, setMTitle] = useState('');
  const [mTargetDate, setMTargetDate] = useState('');
  const [mDescription, setMDescription] = useState('');

  // Goal Form
  const [gTitle, setGTitle] = useState('');
  const [gType, setGType] = useState<GoalType>('Release');

  const handleAddMilestone = () => {
    if (!mTitle.trim()) return;
    const newM: ReleaseMilestone = {
      id: `m-${Date.now()}`,
      title: mTitle.trim(),
      targetDate: mTargetDate || new Date().toISOString().split('T')[0],
      status: 'Upcoming',
      description: mDescription,
      isCompleted: false,
    };
    onChangeMilestones([...milestones, newM]);
    setMTitle('');
    setMTargetDate('');
    setMDescription('');
  };

  const handleToggleMilestone = (id: string) => {
    const updated = milestones.map((m) => {
      if (m.id === id) {
        const nextCompleted = !m.isCompleted;
        return {
          ...m,
          isCompleted: nextCompleted,
          status: (nextCompleted ? 'Achieved' : 'In Progress') as MilestoneStatus,
        };
      }
      return m;
    });
    onChangeMilestones(updated);
  };

  const handleDeleteMilestone = (id: string) => {
    onChangeMilestones(milestones.filter((m) => m.id !== id));
  };

  const handleAddGoal = () => {
    if (!gTitle.trim()) return;
    const newG: ReleaseGoal = {
      id: `g-${Date.now()}`,
      title: gTitle.trim(),
      type: gType,
      status: 'Not Started',
    };
    onChangeGoals([...goals, newG]);
    setGTitle('');
  };

  const handleToggleGoalStatus = (id: string) => {
    const updated = goals.map((g) => {
      if (g.id === id) {
        const nextStatus: GoalStatus =
          g.status === 'Not Started'
            ? 'In Progress'
            : g.status === 'In Progress'
            ? 'Achieved'
            : 'Not Started';
        return { ...g, status: nextStatus };
      }
      return g;
    });
    onChangeGoals(updated);
  };

  const handleDeleteGoal = (id: string) => {
    onChangeGoals(goals.filter((g) => g.id !== id));
  };

  return (
    <div className="space-y-4 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
      {/* Selector Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'milestones'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            Milestones ({milestones.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('goals')}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
              activeTab === 'goals'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            Release Goals ({goals.length})
          </button>
        </div>
      </div>

      {/* Tab: Milestones */}
      {activeTab === 'milestones' && (
        <div className="space-y-3">
          {/* Milestone Input Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Milestone Title (e.g., Feature Freeze)"
              value={mTitle}
              onChange={(e) => setMTitle(e.target.value)}
              className="sm:col-span-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <input
              type="date"
              value={mTargetDate}
              onChange={(e) => setMTargetDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <button
              type="button"
              onClick={handleAddMilestone}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Milestone
            </button>
          </div>

          {/* List of Milestones */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {milestones.length === 0 ? (
              <div className="text-2xs text-slate-400 text-center py-3 italic">
                No milestones defined for this release yet.
              </div>
            ) : (
              milestones.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="checkbox"
                      checked={m.isCompleted}
                      onChange={() => handleToggleMilestone(m.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
                    />
                    <div className={m.isCompleted ? 'line-through text-slate-400' : 'font-medium'}>
                      {m.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-2xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {m.targetDate}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteMilestone(m.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab: Goals */}
      {activeTab === 'goals' && (
        <div className="space-y-3">
          {/* Goal Input Controls */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Goal Title (e.g. Pass Security Audit)"
              value={gTitle}
              onChange={(e) => setGTitle(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
            />
            <select
              value={gType}
              onChange={(e) => setGType(e.target.value as GoalType)}
              className="px-2 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium"
            >
              <option value="Release">Release Goal</option>
              <option value="Business">Business Goal</option>
              <option value="Technical">Technical Goal</option>
            </select>
            <button
              type="button"
              onClick={handleAddGoal}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center justify-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>

          {/* List of Goals */}
          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {goals.length === 0 ? (
              <div className="text-2xs text-slate-400 text-center py-3 italic">
                No goals set for this release.
              </div>
            ) : (
              goals.map((g) => (
                <div
                  key={g.id}
                  className="flex items-center justify-between p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded text-2xs font-bold uppercase ${
                        g.type === 'Technical'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                          : g.type === 'Business'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                          : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400'
                      }`}
                    >
                      {g.type}
                    </span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">{g.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleToggleGoalStatus(g.id)}
                      className={`px-2 py-0.5 rounded text-2xs font-semibold transition-colors ${
                        g.status === 'Achieved'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                          : g.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {g.status}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteGoal(g.id)}
                      className="text-slate-400 hover:text-rose-500 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
