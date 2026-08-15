import React, { useState } from 'react';
import { Tag, Plus, X, Check, Palette } from 'lucide-react';

export interface TaskDetailLabelsProps {
  labels: string[];
  onUpdateLabels: (newLabels: string[]) => Promise<void>;
}

const PRESET_LABELS = [
  { name: 'Frontend', color: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' },
  { name: 'Backend', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' },
  { name: 'API', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' },
  { name: 'Bug', color: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' },
  { name: 'Security', color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' },
  { name: 'Design', color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20' },
  { name: 'High Impact', color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' },
  { name: 'Refactor', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/20' },
  { name: 'Docs', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' },
];

export const TaskDetailLabels: React.FC<TaskDetailLabelsProps> = ({
  labels = [],
  onUpdateLabels,
}) => {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [customLabelInput, setCustomLabelInput] = useState('');

  const handleToggleLabel = async (labelName: string) => {
    let updated: string[];
    if (labels.includes(labelName)) {
      updated = labels.filter((l) => l !== labelName);
    } else {
      updated = [...labels, labelName];
    }
    await onUpdateLabels(updated);
  };

  const handleCreateCustomLabel = async () => {
    const trimmed = customLabelInput.trim();
    if (trimmed && !labels.includes(trimmed)) {
      const updated = [...labels, trimmed];
      await onUpdateLabels(updated);
      setCustomLabelInput('');
      setIsAddOpen(false);
    }
  };

  const getLabelStyle = (name: string) => {
    const found = PRESET_LABELS.find((p) => p.name.toLowerCase() === name.toLowerCase());
    return found
      ? found.color
      : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20';
  };

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Labels
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(!isAddOpen)}
          className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition"
          title="Add or Manage Labels"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Active Label Chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {labels.length === 0 ? (
          <span className="text-xs text-slate-400 italic">No labels attached</span>
        ) : (
          labels.map((lbl) => (
            <span
              key={lbl}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-sm ${getLabelStyle(
                lbl
              )}`}
            >
              <span>{lbl}</span>
              <button
                type="button"
                onClick={() => handleToggleLabel(lbl)}
                className="hover:opacity-100 opacity-60 transition cursor-pointer"
                title={`Remove ${lbl}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))
        )}
      </div>

      {/* Add Label Popover / Picker */}
      {isAddOpen && (
        <div className="p-3 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl space-y-3 text-xs animate-in fade-in duration-150">
          <div className="font-bold text-slate-900 dark:text-white pb-1 border-b border-slate-100 dark:border-slate-700">
            Select or Create Label
          </div>

          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 flex-wrap max-h-32 overflow-y-auto">
            {PRESET_LABELS.map((p) => {
              const isSelected = labels.includes(p.name);
              return (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => handleToggleLabel(p.name)}
                  className={`px-2 py-1 rounded-xl font-bold border text-[11px] transition flex items-center gap-1 cursor-pointer ${p.color} ${
                    isSelected ? 'ring-2 ring-indigo-500 font-extrabold' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                  <span>{p.name}</span>
                </button>
              );
            })}
          </div>

          {/* Custom Label Input */}
          <div className="flex items-center gap-1.5 pt-1">
            <input
              type="text"
              placeholder="Custom label name..."
              value={customLabelInput}
              onChange={(e) => setCustomLabelInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCustomLabel();
              }}
              className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
            <button
              type="button"
              onClick={handleCreateCustomLabel}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
