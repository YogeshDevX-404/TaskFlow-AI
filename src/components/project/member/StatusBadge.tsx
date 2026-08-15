import React from 'react';
import { ProjectMemberStatus } from '../../../types/projectMember';
import { CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: ProjectMemberStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (s: ProjectMemberStatus) => {
    switch (s) {
      case 'active':
        return {
          bg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50',
          dot: 'bg-emerald-500',
          label: 'Active',
          icon: CheckCircle2,
        };
      case 'pending':
        return {
          bg: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
          dot: 'bg-amber-500',
          label: 'Pending',
          icon: Clock,
        };
      case 'suspended':
      default:
        return {
          bg: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
          dot: 'bg-rose-500',
          label: 'Suspended',
          icon: AlertTriangle,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${sizeClasses} ${config.bg}`}
    >
      <Icon className="w-3.5 h-3.5" />
      <span>{config.label}</span>
    </span>
  );
};
