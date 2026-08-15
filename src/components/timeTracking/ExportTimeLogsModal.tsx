import React, { useState } from 'react';
import { TimeEntryService } from '../../services/api/timeEntryService';
import { TimeEntryFilterParams } from '../../types/timeEntry';
import { Download, FileText, FileSpreadsheet, X } from 'lucide-react';

interface ExportTimeLogsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters?: TimeEntryFilterParams;
}

export const ExportTimeLogsModal: React.FC<ExportTimeLogsModalProps> = ({
  isOpen,
  onClose,
  currentFilters = {},
}) => {
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await TimeEntryService.exportTimeEntries(format, currentFilters);
      onClose();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="font-bold text-slate-900 dark:text-white">Export Timesheet</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export the current work logs and time entries based on active filters.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormat('csv')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                format === 'csv'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-6 h-6" />
              CSV Format
            </button>

            <button
              type="button"
              onClick={() => setFormat('json')}
              className={`p-4 rounded-xl border flex flex-col items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-all ${
                format === 'json'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <FileText className="w-6 h-6" />
              JSON Format
            </button>
          </div>

          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Download'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
