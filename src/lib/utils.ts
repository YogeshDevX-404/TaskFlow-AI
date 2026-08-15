import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'No due date';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function getPriorityBadgeColor(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
    case 'high':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'medium':
      return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
    case 'low':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}

export function getStatusBadgeColor(status: string) {
  switch (status) {
    case 'done':
      return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    case 'in_progress':
      return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    case 'in_review':
      return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'todo':
      return 'bg-slate-500/10 text-slate-300 border-slate-500/20';
    case 'backlog':
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    case 'canceled':
      return 'bg-red-500/10 text-red-400 border-red-500/20';
    default:
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  }
}
