import React from 'react';
import { Users, UserPlus, ArrowRight } from 'lucide-react';
import { RoleBadge } from '../project/member/RoleBadge';
import { StatusBadge } from '../project/member/StatusBadge';

interface RecentMembersWidgetProps {
  members: Array<{
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
    joinedAt: string;
  }>;
  onViewAllMembers?: () => void;
}

export const RecentMembersWidget: React.FC<RecentMembersWidgetProps> = ({
  members,
  onViewAllMembers,
}) => {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <Users className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent Project Members</h3>
        </div>

        {onViewAllMembers && (
          <button
            onClick={onViewAllMembers}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="space-y-2.5">
        {members.slice(0, 5).map((m) => (
          <div
            key={m.id}
            className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              {m.avatar ? (
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {m.name.charAt(0)}
                </div>
              )}

              <div className="min-w-0">
                <p className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                  {m.name}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{m.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <RoleBadge role={m.role as any} size="sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
