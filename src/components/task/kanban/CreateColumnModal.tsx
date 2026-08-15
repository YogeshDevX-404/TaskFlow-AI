import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2, Circle } from 'lucide-react';
import { BoardColumn } from '../../../types/board';
import { TaskStatus } from '../../../types/task';
import { useBoardStore } from '../../../store/useBoardStore';

interface CreateColumnModalProps {
  isOpen: boolean;
  editingColumn?: BoardColumn | null;
  onClose: () => void;
}

const COLOR_PRESETS = [
  '#64748B', // Slate
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#EAB308', // Yellow
  '#10B981', // Green
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

const ICON_OPTIONS = [
  'Circle',
  'Clock',
  'Eye',
  'FlaskConical',
  'CheckCircle2',
  'AlertCircle',
  'XCircle',
  'Inbox',
  'Layers',
];

export const CreateColumnModal: React.FC<CreateColumnModalProps> = ({
  isOpen,
  editingColumn,
  onClose,
}) => {
  const { addColumn, updateColumn } = useBoardStore();

  const [name, setName] = useState('');
  const [statusKey, setStatusKey] = useState<TaskStatus>('Todo');
  const [color, setColor] = useState('#3B82F6');
  const [icon, setIcon] = useState('Circle');
  const [wipLimit, setWipLimit] = useState(0);

  useEffect(() => {
    if (editingColumn) {
      setName(editingColumn.name);
      setStatusKey(editingColumn.statusKey);
      setColor(editingColumn.color || '#3B82F6');
      setIcon(editingColumn.icon || 'Circle');
      setWipLimit(editingColumn.wipLimit || 0);
    } else {
      setName('');
      setStatusKey('Todo');
      setColor('#3B82F6');
      setIcon('Circle');
      setWipLimit(0);
    }
  }, [editingColumn, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingColumn) {
      await updateColumn(editingColumn.id, {
        name: name.trim(),
        statusKey,
        color,
        icon,
        wipLimit,
      });
    } else {
      await addColumn({
        name: name.trim(),
        statusKey,
        color,
        icon,
        wipLimit,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100 flex items-center gap-2">
            {editingColumn ? <Edit2 className="w-4 h-4 text-indigo-500" /> : <Plus className="w-4 h-4 text-indigo-500" />}
            <span>{editingColumn ? 'Edit Column' : 'Add Board Column'}</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div>
            <label className="block font-semibold mb-1 text-slate-900 dark:text-slate-100">
              Column Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Code Review, QA Testing"
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-900 dark:text-slate-100">
              Status Mapping
            </label>
            <select
              value={statusKey}
              onChange={(e) => setStatusKey(e.target.value as TaskStatus)}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Backlog">Backlog</option>
              <option value="Todo">Todo</option>
              <option value="In Progress">In Progress</option>
              <option value="In Review">In Review</option>
              <option value="Testing">Testing</option>
              <option value="Done">Done</option>
              <option value="Blocked">Blocked</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-1.5 text-slate-900 dark:text-slate-100">
              Column Accent Color
            </label>
            <div className="flex items-center gap-2">
              {COLOR_PRESETS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-125 ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-800' : 'hover:scale-110'
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold mb-1 text-slate-900 dark:text-slate-100">
              WIP Limit (0 = Unlimited)
            </label>
            <input
              type="number"
              min="0"
              value={wipLimit}
              onChange={(e) => setWipLimit(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-full p-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-sm cursor-pointer"
            >
              {editingColumn ? 'Update Column' : 'Create Column'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
