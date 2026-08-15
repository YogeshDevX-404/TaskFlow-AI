import React, { useState } from 'react';
import { useSprintStore } from '../../store/useSprintStore';
import { useTaskStore } from '../../store/useTaskStore';
import { Sprint } from '../../types/sprint';
import { Task } from '../../types/task';
import {
  Layers,
  ArrowRight,
  Plus,
  Minus,
  CheckCircle2,
  Clock,
  Zap,
  Target,
  Flame,
  Search,
  Filter,
  User,
  AlertCircle,
  Play,
  FileText,
} from 'lucide-react';

interface SprintPlanningProps {
  sprint: Sprint | null;
  sprints: Sprint[];
  onSelectSprint: (sprint: Sprint) => void;
  onStartSprint: (sprint: Sprint) => void;
  onCreateSprint: () => void;
}

export const SprintPlanning: React.FC<SprintPlanningProps> = ({
  sprint,
  sprints,
  onSelectSprint,
  onStartSprint,
  onCreateSprint,
}) => {
  const { tasks, updateTask } = useTaskStore();
  const { assignTasksToSprint, removeTaskFromSprint, updateSprint } = useSprintStore();

  const [backlogSearch, setBacklogSearch] = useState('');
  const [sprintSearch, setSprintSearch] = useState('');
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(sprint?.goal || '');
  const [notesText, setNotesText] = useState(sprint?.description || '');

  if (!sprint) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
          <Layers className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          No Sprint Selected for Planning
        </h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto">
          Select an existing sprint or create a new sprint to begin estimating story points and moving backlog items into scope.
        </p>
        <button
          onClick={onCreateSprint}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md shadow-indigo-500/20 inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Sprint</span>
        </button>
      </div>
    );
  }

  const selectedProjectId =
    typeof sprint.project === 'object' ? sprint.project.id : sprint.project;

  const sprintTaskIds = new Set(
    Array.isArray(sprint.taskIds)
      ? sprint.taskIds
      : Array.isArray(sprint.tasks)
      ? sprint.tasks.map((t: any) => (typeof t === 'object' ? t.id || t._id : t))
      : []
  );

  // Partition project tasks into Backlog vs Sprint Tasks
  const projectTasks = tasks.filter((t) => {
    const tProj = typeof t.project === 'object' ? t.project.id : t.project || t.projectId;
    return !selectedProjectId || tProj === selectedProjectId;
  });

  const sprintTasks = projectTasks.filter((t) => {
    const tSprint = typeof t.sprint === 'object' ? t.sprint?.id : t.sprint;
    return tSprint === sprint.id || sprintTaskIds.has(t.id);
  });

  const backlogTasks = projectTasks.filter((t) => {
    const tSprint = typeof t.sprint === 'object' ? t.sprint?.id : t.sprint;
    return !tSprint && !sprintTaskIds.has(t.id);
  });

  // Calculate story points sum
  const plannedPoints = sprintTasks.reduce((acc, t) => acc + (t.storyPoints || 0), 0);
  const capacity = sprint.capacity || 40;
  const capacityUsagePercent = Math.min(100, Math.round((plannedPoints / capacity) * 100));

  // Filter lists
  const filteredBacklog = backlogTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(backlogSearch.toLowerCase()) ||
      t.taskKey.toLowerCase().includes(backlogSearch.toLowerCase())
  );

  const filteredSprintTasks = sprintTasks.filter(
    (t) =>
      t.title.toLowerCase().includes(sprintSearch.toLowerCase()) ||
      t.taskKey.toLowerCase().includes(sprintSearch.toLowerCase())
  );

  const handleAddTask = async (taskId: string) => {
    await assignTasksToSprint(sprint.id, [taskId]);
    await updateTask(taskId, { sprint: sprint.id } as any);
  };

  const handleRemoveTask = async (taskId: string) => {
    await removeTaskFromSprint(sprint.id, taskId);
    await updateTask(taskId, { sprint: null } as any);
  };

  const handleSaveGoal = async () => {
    await updateSprint(sprint.id, { goal: goalText, description: notesText });
    setEditingGoal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Sprint Selector & Planning Summary Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <select
                  value={sprint.id}
                  onChange={(e) => {
                    const found = sprints.find((s) => s.id === e.target.value);
                    if (found) onSelectSprint(found);
                  }}
                  className="font-black text-lg text-slate-900 dark:text-slate-100 bg-transparent outline-none cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  {sprints.map((s) => (
                    <option key={s.id} value={s.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {sprint.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {sprint.startDate ? new Date(sprint.startDate).toLocaleDateString() : 'TBD'} -{' '}
                {sprint.endDate ? new Date(sprint.endDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {sprint.status === 'Planning' && (
              <button
                onClick={() => onStartSprint(sprint)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-md shadow-emerald-500/20 flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Start Sprint</span>
              </button>
            )}

            <button
              onClick={onCreateSprint}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Sprint</span>
            </button>
          </div>
        </div>

        {/* Capacity Bar & Goal Editor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Capacity Meter */}
          <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between font-bold">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-purple-500" />
                <span>Sprint Capacity</span>
              </span>
              <span
                className={
                  plannedPoints > capacity
                    ? 'text-rose-600 dark:text-rose-400 font-black'
                    : 'text-slate-800 dark:text-slate-200'
                }
              >
                {plannedPoints} / {capacity} pts
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  plannedPoints > capacity
                    ? 'bg-rose-500'
                    : capacityUsagePercent > 85
                    ? 'bg-amber-500'
                    : 'bg-purple-600'
                }`}
                style={{ width: `${Math.min(100, capacityUsagePercent)}%` }}
              />
            </div>
            {plannedPoints > capacity && (
              <p className="text-[10px] text-rose-500 font-medium">
                Scope exceeds target team capacity by {plannedPoints - capacity} story points!
              </p>
            )}
          </div>

          {/* Sprint Goal */}
          <div className="md:col-span-2 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-indigo-500" />
                <span>Sprint Goal & Notes</span>
              </span>
              <button
                onClick={() => {
                  if (editingGoal) handleSaveGoal();
                  else setEditingGoal(true);
                }}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                {editingGoal ? 'Save Notes' : 'Edit Goal'}
              </button>
            </div>

            {editingGoal ? (
              <div className="space-y-2 pt-1">
                <input
                  type="text"
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  placeholder="Enter sprint goal..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 font-medium text-slate-900 dark:text-slate-100"
                />
              </div>
            ) : (
              <p className="font-medium text-slate-800 dark:text-slate-200 line-clamp-2">
                {sprint.goal || 'No sprint goal set yet. Click Edit Goal to define scope objective.'}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Planning View: Backlog vs Sprint Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel: Product Backlog */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-[650px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>Product Backlog</span>
                <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-extrabold">
                  {backlogTasks.length}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Unassigned items available for current sprint</p>
            </div>

            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search..."
                value={backlogSearch}
                onChange={(e) => setBacklogSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredBacklog.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                <CheckCircle2 className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-medium">No unassigned tasks found in backlog.</p>
              </div>
            ) : (
              filteredBacklog.map((task) => (
                <div
                  key={task.id}
                  className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 transition"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {task.taskKey}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {task.type}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {task.storyPoints || 0} pts
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleAddTask(task.id)}
                    className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-600 hover:text-white text-indigo-600 dark:text-indigo-400 font-bold transition flex items-center gap-1 text-[11px] shrink-0"
                    title="Add to Sprint"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel: Sprint Scope */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col h-[650px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{sprint.name} Scope</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold">
                  {sprintTasks.length} Tasks ({plannedPoints} pts)
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">Items committed for execution</p>
            </div>

            <div className="relative w-40">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search scope..."
                value={sprintSearch}
                onChange={(e) => setSprintSearch(e.target.value)}
                className="w-full pl-8 pr-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-medium outline-none"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredSprintTasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Target className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-xs font-medium">Sprint backlog is empty.</p>
                <p className="text-[10px] mt-1 text-slate-400">
                  Click "+ Add" on any item in the left panel to commit it to this sprint.
                </p>
              </div>
            ) : (
              filteredSprintTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-indigo-50/40 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 rounded-xl p-3 flex items-center justify-between gap-3 transition"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                        {task.taskKey}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                        {task.status}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
                        {task.storyPoints || 0} pts
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {task.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => handleRemoveTask(task.id)}
                    className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/80 hover:bg-rose-600 hover:text-white text-rose-600 dark:text-rose-400 font-bold transition flex items-center gap-1 text-[11px] shrink-0"
                    title="Remove from Sprint"
                  >
                    <Minus className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Remove</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Localized Retrospective & Activity Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
        {/* Retrospective Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Sprint Retrospective</span>
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">What went well?</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none"
                rows={2}
                placeholder="List achievements, good teamwork, or process successes..."
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">What could be improved?</label>
              <textarea
                className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-xl outline-none"
                rows={2}
                placeholder="Identify bottlenecks, technical debt, or workflow friction..."
                value={notesText}
                onChange={(e) => setNotesText(e.target.value)}
              />
            </div>

            <button
              onClick={handleSaveGoal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition flex items-center gap-1.5"
            >
              <span>Save Retrospective</span>
            </button>
          </div>
        </div>

        {/* Sprint Activity Timeline Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Sprint Activity Timeline</span>
            </h3>
          </div>

          <div className="text-xs text-slate-500 space-y-3 max-h-64 overflow-y-auto">
            <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/40">
              <div className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-[10px] flex items-center justify-center font-bold">
                T
              </div>
              <div>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Sprint scope configured.
                </p>
                <span className="text-[10px] text-slate-400">Recent Action</span>
              </div>
            </div>

            <div className="text-center py-6 text-slate-400 text-[11px]">
              No additional sprint logs recorded for today.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

