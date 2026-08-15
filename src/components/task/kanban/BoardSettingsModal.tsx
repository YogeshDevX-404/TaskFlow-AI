import React, { useState } from 'react';
import { X, Sliders, Check, AlertCircle } from 'lucide-react';
import { useBoardStore } from '../../../store/useBoardStore';
import { BoardSettings, BoardColumn } from '../../../types/board';

interface BoardSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BoardSettingsModal: React.FC<BoardSettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, columns, updateSettings, updateColumn } = useBoardStore();

  const [cardSize, setCardSize] = useState<BoardSettings['cardSize']>(settings.cardSize || 'default');
  const [showLabels, setShowLabels] = useState(settings.showLabels ?? true);
  const [showStoryPoints, setShowStoryPoints] = useState(settings.showStoryPoints ?? true);
  const [showAvatars, setShowAvatars] = useState(settings.showAvatars ?? true);
  const [showDueDates, setShowDueDates] = useState(settings.showDueDates ?? true);

  const [wipLimits, setWipLimits] = useState<Record<string, number>>(
    columns.reduce((acc, col) => ({ ...acc, [col.id]: col.wipLimit || 0 }), {})
  );

  if (!isOpen) return null;

  const handleSave = async () => {
    await updateSettings({
      cardSize,
      showLabels,
      showStoryPoints,
      showAvatars,
      showDueDates,
    });

    // Save WIP limits
    for (const col of columns) {
      const newLimit = wipLimits[col.id] ?? 0;
      if (newLimit !== col.wipLimit) {
        await updateColumn(col.id, { wipLimit: newLimit });
      }
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-semibold text-base text-slate-900 dark:text-slate-100">
              Board Display & WIP Settings
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs text-slate-700 dark:text-slate-300 max-h-[75vh] overflow-y-auto">
          {/* Card Size Selector */}
          <div>
            <label className="block font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Card Size Preset
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['compact', 'default', 'expanded'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setCardSize(sz)}
                  className={`p-3 rounded-xl border text-center capitalize font-semibold transition cursor-pointer ${
                    cardSize === sz
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-600 dark:text-indigo-400 ring-2 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Metadata Options */}
          <div>
            <label className="block font-semibold mb-2 text-slate-900 dark:text-slate-100">
              Card Metadata Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={showLabels}
                  onChange={(e) => setShowLabels(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="font-medium">Show Labels</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={showStoryPoints}
                  onChange={(e) => setShowStoryPoints(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="font-medium">Show Story Points</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={showAvatars}
                  onChange={(e) => setShowAvatars(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="font-medium">Show Assignee Avatars</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                <input
                  type="checkbox"
                  checked={showDueDates}
                  onChange={(e) => setShowDueDates(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                />
                <span className="font-medium">Show Due Dates</span>
              </label>
            </div>
          </div>

          {/* Column Work In Progress (WIP) Limits */}
          <div>
            <label className="block font-semibold mb-1 text-slate-900 dark:text-slate-100">
              Column Work In Progress (WIP) Limits
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
              Set maximum task limits per column (0 = unlimited). Exceeding limits will highlight the column.
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {columns.map((col) => (
                <div
                  key={col.id}
                  className="flex items-center justify-between p-2 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/40"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="font-medium">{col.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">Max Tasks:</span>
                    <input
                      type="number"
                      min="0"
                      value={wipLimits[col.id] ?? 0}
                      onChange={(e) =>
                        setWipLimits({ ...wipLimits, [col.id]: Math.max(0, parseInt(e.target.value) || 0) })
                      }
                      className="w-16 p-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded font-mono text-center"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition shadow-sm cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};
