import React from 'react';
import { useNotificationStore } from '../../store/useNotificationStore';
import {
  X,
  Bell,
  Mail,
  CheckCircle2,
  Sliders,
  MessageSquare,
  AtSign,
  FolderKanban,
  Zap,
  Tag,
  Clock,
  Sparkles,
} from 'lucide-react';

export const NotificationPreferencesModal: React.FC = () => {
  const isPreferencesOpen = useNotificationStore((state) => state.isPreferencesOpen);
  const setPreferencesOpen = useNotificationStore((state) => state.setPreferencesOpen);
  const preferences = useNotificationStore((state) => state.preferences);
  const updatePreferences = useNotificationStore((state) => state.updatePreferences);

  if (!isPreferencesOpen) return null;

  const handleToggle = (key: keyof typeof preferences) => {
    if (typeof preferences[key] === 'boolean') {
      updatePreferences({ [key]: !preferences[key] });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Notification Preferences
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customize delivery channels and activity alerts
              </p>
            </div>
          </div>

          <button
            onClick={() => setPreferencesOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Main Delivery Channels */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-indigo-500" /> Delivery Channels
            </h4>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex items-center gap-3">
                  <Bell className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      In-App Notifications
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Receive live alerts in the TaskFlow bell drawer
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.inAppNotifications}
                  onChange={() => handleToggle('inAppNotifications')}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                      Email Notifications
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block">
                      Get email updates for urgent mentions and assignments
                    </span>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.emailNotifications}
                  onChange={() => handleToggle('emailNotifications')}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Activity Alerts */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Activity Alerts
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-medium text-xs text-slate-800 dark:text-slate-200">Task Assignments</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.taskNotifications}
                  onChange={() => handleToggle('taskNotifications')}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-xs text-slate-800 dark:text-slate-200">Comments</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.commentNotifications}
                  onChange={() => handleToggle('commentNotifications')}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <AtSign className="w-4 h-4 text-purple-500" />
                  <span className="font-medium text-xs text-slate-800 dark:text-slate-200">Direct Mentions</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.mentionNotifications}
                  onChange={() => handleToggle('mentionNotifications')}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <FolderKanban className="w-4 h-4 text-cyan-500" />
                  <span className="font-medium text-xs text-slate-800 dark:text-slate-200">Project Updates</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.projectNotifications}
                  onChange={() => handleToggle('projectNotifications')}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-violet-500" />
                  <span className="font-medium text-xs text-slate-800 dark:text-slate-200">Sprint Lifecycle</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.sprintNotifications}
                  onChange={() => handleToggle('sprintNotifications')}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-teal-500" />
                  <span className="font-medium text-xs text-slate-800 dark:text-slate-200">Release Publishing</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.releaseNotifications}
                  onChange={() => handleToggle('releaseNotifications')}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Digest Summaries */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" /> Automated Digest Summaries
            </h4>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Daily Digest</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Morning summary of due tasks and pending approvals</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.dailyDigest}
                  onChange={() => handleToggle('dailyDigest')}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-950/40 cursor-pointer transition">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-slate-100 block">Weekly Executive Digest</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">Monday sprint velocity, roadmap progress & team metrics</span>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.weeklyDigest}
                  onChange={() => handleToggle('weeklyDigest')}
                  className="w-4 h-4 rounded text-indigo-600 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
          <button
            onClick={() => setPreferencesOpen(false)}
            className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
