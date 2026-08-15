import React, { useState } from 'react';
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskType,
  TaskFormData,
  TaskUserRef,
} from '../../../types/task';
import {
  Calendar,
  Clock,
  User,
  Shield,
  Briefcase,
  FolderKanban,
  Building2,
  Tag,
  Hash,
  AlertCircle,
  Check,
  Edit3,
} from 'lucide-react';

export interface TaskDetailPropertiesPanelProps {
  task: Task;
  availableMembers?: Array<{ id: string; name: string; email?: string; avatar?: string }>;
  availableProjects?: Array<{ id: string; name: string; projectKey?: string }>;
  onUpdateProperties: (data: Partial<TaskFormData>) => Promise<void>;
  onUpdateStatus: (status: TaskStatus) => void;
  onUpdatePriority: (priority: TaskPriority) => void;
}

const ALL_STATUSES: TaskStatus[] = [
  'Backlog',
  'Todo',
  'In Progress',
  'In Review',
  'Testing',
  'Done',
  'Blocked',
  'Cancelled',
];

const ALL_PRIORITIES: TaskPriority[] = [
  'Lowest',
  'Low',
  'Medium',
  'High',
  'Highest',
  'Urgent',
];

const ALL_TYPES: TaskType[] = [
  'Task',
  'Bug',
  'Story',
  'Epic',
  'Feature',
  'Improvement',
  'Research',
  'Spike',
];

export const TaskDetailPropertiesPanel: React.FC<TaskDetailPropertiesPanelProps> = ({
  task,
  availableMembers = [],
  availableProjects = [],
  onUpdateProperties,
  onUpdateStatus,
  onUpdatePriority,
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);

  // Field states
  const [assigneeId, setAssigneeId] = useState<string>(
    typeof task.assignee === 'object' ? task.assignee.id : task.assignee || ''
  );
  const [storyPoints, setStoryPoints] = useState<number>(task.storyPoints || 0);
  const [estimatedHours, setEstimatedHours] = useState<number>(task.estimatedHours || 0);
  const [spentHours, setSpentHours] = useState<number>(task.spentHours || 0);
  const [startDate, setStartDate] = useState<string>(
    task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : ''
  );
  const [dueDate, setDueDate] = useState<string>(
    task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  );
  const [dateError, setDateError] = useState<string | null>(null);

  const getMemberName = (userRef?: string | TaskUserRef) => {
    if (!userRef) return 'Unassigned';
    if (typeof userRef === 'object') {
      return userRef.name || `${userRef.firstName || ''} ${userRef.lastName || ''}`.trim() || userRef.email || 'User';
    }
    const found = availableMembers.find((m) => m.id === userRef);
    return found ? found.name : 'User';
  };

  const getMemberAvatar = (userRef?: string | TaskUserRef) => {
    if (typeof userRef === 'object' && userRef.avatar) return userRef.avatar;
    const name = getMemberName(userRef);
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`;
  };

  const projectName = typeof task.project === 'object' ? task.project.name : task.projectName || 'Project';
  const workspaceName = typeof task.workspace === 'object' ? task.workspace.name : 'Workspace';
  const organizationName = typeof task.organization === 'object' ? task.organization.name : 'Organization';

  const handleSaveField = async (field: string) => {
    try {
      setDateError(null);
      if (startDate && dueDate && new Date(startDate) > new Date(dueDate)) {
        setDateError('Start date cannot be after due date');
        return;
      }

      await onUpdateProperties({
        assigneeId: assigneeId || undefined,
        storyPoints: Number(storyPoints) || 0,
        estimatedHours: Number(estimatedHours) || 0,
        spentHours: Number(spentHours) || 0,
        startDate: startDate || undefined,
        dueDate: dueDate || undefined,
      });
      setEditingField(null);
    } catch (err: any) {
      setDateError(err.message || 'Failed to update property');
    }
  };

  return (
    <div className="bg-slate-50/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
      <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
        Properties & Details
      </h3>

      {dateError && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{dateError}</span>
        </div>
      )}

      <div className="space-y-3.5 text-xs">
        {/* Status */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Check className="w-3.5 h-3.5 text-indigo-500" />
            <span>Status</span>
          </span>
          <select
            value={task.status}
            onChange={(e) => onUpdateStatus(e.target.value as TaskStatus)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st}>
                {st}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            <span>Priority</span>
          </span>
          <select
            value={task.priority}
            onChange={(e) => onUpdatePriority(e.target.value as TaskPriority)}
            className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-bold text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
          >
            {ALL_PRIORITIES.map((pr) => (
              <option key={pr} value={pr}>
                {pr}
              </option>
            ))}
          </select>
        </div>

        {/* Assignee */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <User className="w-3.5 h-3.5 text-indigo-500" />
            <span>Assignee</span>
          </span>
          {editingField === 'assignee' ? (
            <div className="flex items-center gap-1.5">
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                className="px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-indigo-500 text-slate-900 dark:text-white font-medium text-xs focus:outline-none"
              >
                <option value="">Unassigned</option>
                {availableMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => handleSaveField('assignee')}
                className="p-1 rounded-lg bg-indigo-600 text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setEditingField('assignee')}
              className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <img
                src={getMemberAvatar(task.assignee)}
                alt="Assignee Avatar"
                className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-slate-700"
              />
              <span className="font-semibold text-slate-900 dark:text-white">
                {getMemberName(task.assignee)}
              </span>
            </button>
          )}
        </div>

        {/* Reporter */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Shield className="w-3.5 h-3.5 text-blue-500" />
            <span>Reporter</span>
          </span>
          <div className="flex items-center gap-2">
            <img
              src={getMemberAvatar(task.reporter)}
              alt="Reporter Avatar"
              className="w-5 h-5 rounded-full object-cover border border-slate-300 dark:border-slate-700"
            />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {getMemberName(task.reporter)}
            </span>
          </div>
        </div>

        {/* Project */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <FolderKanban className="w-3.5 h-3.5 text-indigo-500" />
            <span>Project</span>
          </span>
          <span className="font-bold text-slate-900 dark:text-white bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded-lg border border-indigo-200 dark:border-indigo-800/50">
            {projectName}
          </span>
        </div>

        {/* Workspace & Organization */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Briefcase className="w-3.5 h-3.5 text-emerald-500" />
            <span>Workspace</span>
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {workspaceName}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-purple-500" />
            <span>Organization</span>
          </span>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {organizationName}
          </span>
        </div>

        <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

        {/* Story Points */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Hash className="w-3.5 h-3.5 text-indigo-500" />
            <span>Story Points</span>
          </span>
          {editingField === 'storyPoints' ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
                className="w-16 px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-indigo-500 text-slate-900 dark:text-white font-bold text-xs"
              />
              <button
                type="button"
                onClick={() => handleSaveField('storyPoints')}
                className="p-1 rounded-lg bg-indigo-600 text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setEditingField('storyPoints')}
              className="flex items-center gap-1 cursor-pointer hover:opacity-80"
            >
              <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold font-mono">
                {task.storyPoints || 0} pts
              </span>
            </div>
          )}
        </div>

        {/* Estimated & Spent Hours */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span>Est / Spent Hours</span>
          </span>
          {editingField === 'hours' ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                min="0"
                placeholder="Est"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(Number(e.target.value))}
                className="w-12 px-1.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-indigo-500 text-xs text-center"
              />
              <span className="text-slate-400">/</span>
              <input
                type="number"
                min="0"
                placeholder="Spent"
                value={spentHours}
                onChange={(e) => setSpentHours(Number(e.target.value))}
                className="w-12 px-1.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-indigo-500 text-xs text-center"
              />
              <button
                type="button"
                onClick={() => handleSaveField('hours')}
                className="p-1 rounded-lg bg-indigo-600 text-white"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div
              onClick={() => setEditingField('hours')}
              className="font-mono font-semibold text-slate-800 dark:text-slate-200 cursor-pointer hover:underline"
            >
              {task.estimatedHours || 0}h est / {task.spentHours || 0}h spent
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-blue-500" />
            <span>Start Date</span>
          </span>
          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              onUpdateProperties({ startDate: e.target.value || undefined });
            }}
            className="px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div className="flex items-center justify-between gap-3 py-1">
          <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-rose-500" />
            <span>Due Date</span>
          </span>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value);
              onUpdateProperties({ dueDate: e.target.value || undefined });
            }}
            className="px-2 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-mono text-xs focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          />
        </div>

        <div className="my-2 border-t border-slate-200 dark:border-slate-800" />

        {/* Created & Updated Metadata */}
        <div className="space-y-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
          <div className="flex items-center justify-between">
            <span>Created:</span>
            <span>{new Date(task.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Updated:</span>
            <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
