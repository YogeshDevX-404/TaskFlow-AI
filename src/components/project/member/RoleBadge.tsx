import React from 'react';
import { ProjectMemberRole } from '../../../types/projectMember';
import { ShieldAlert, ShieldCheck, Code2, Bug, Eye } from 'lucide-react';

interface RoleBadgeProps {
  role: ProjectMemberRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const getRoleConfig = (r: ProjectMemberRole) => {
    switch (r) {
      case 'Project Owner':
        return {
          bg: 'bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: ShieldAlert,
        };
      case 'Project Admin':
        return {
          bg: 'bg-blue-500/10 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          icon: ShieldCheck,
        };
      case 'Developer':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
          icon: Code2,
        };
      case 'Tester':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: Bug,
        };
      case 'Viewer':
      default:
        return {
          bg: 'bg-slate-500/10 dark:bg-slate-500/20 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          icon: Eye,
        };
    }
  };

  const config = getRoleConfig(role);
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${config.bg}`}
    >
      <Icon className={iconSize} />
      <span>{role}</span>
    </span>
  );
};
