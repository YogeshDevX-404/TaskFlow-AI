import React, { useState, useEffect } from 'react';
import { MemberWorkload } from '../../types/workload';
import { useUpdateMemberCapacity } from '../../hooks/useWorkload';
import { X, Settings2, Check, Clock } from 'lucide-react';

interface CapacityConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: MemberWorkload | null;
  organizationId?: string;
}

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CapacityConfigModal: React.FC<CapacityConfigModalProps> = ({
  isOpen,
  onClose,
  member,
  organizationId,
}) => {
  const updateMutation = useUpdateMemberCapacity();

  const [weeklyHours, setWeeklyHours] = useState<number>(40);
  const [dailyHours, setDailyHours] = useState<number>(8);
  const [workingDays, setWorkingDays] = useState<string[]>(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
  const [timezone, setTimezone] = useState<string>('UTC');
  const [startOfWeek, setStartOfWeek] = useState<string>('Monday');
  const [endOfWeek, setEndOfWeek] = useState<string>('Friday');
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (member) {
      setWeeklyHours(member.capacity.weeklyCapacityHours || 40);
      setDailyHours(member.capacity.dailyCapacityHours || 8);
      setWorkingDays(member.capacity.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']);
      setTimezone(member.capacity.timezone || 'UTC');
    }
  }, [member]);

  if (!isOpen || !member) return null;

  const toggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      await updateMutation.mutateAsync({
        userId: member.userId,
        capacityData: {
          organization: organizationId,
          weeklyCapacityHours: Number(weeklyHours),
          dailyCapacityHours: Number(dailyHours),
          workingDays,
          timezone,
          startOfWeek,
          endOfWeek,
        },
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || 'Failed to update member capacity');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Configure Capacity
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {member.user.name} ({member.user.email})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
              {errorMsg}
            </div>
          )}

          {/* Capacity Hours inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Weekly Capacity (Hours)
              </label>
              <input
                type="number"
                min="0"
                max="168"
                value={weeklyHours}
                onChange={(e) => setWeeklyHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Daily Capacity (Hours)
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={dailyHours}
                onChange={(e) => setDailyHours(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          {/* Working Days Checkboxes */}
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-2">
              Working Days
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_DAYS.map((day) => {
                const checked = workingDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                      checked
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 border-indigo-300 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400'
                        : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timezone & Start of Week */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Timezone
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Start of Week
              </label>
              <select
                value={startOfWeek}
                onChange={(e) => setStartOfWeek(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Monday">Monday</option>
                <option value="Sunday">Sunday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-500/20"
            >
              {updateMutation.isPending ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
