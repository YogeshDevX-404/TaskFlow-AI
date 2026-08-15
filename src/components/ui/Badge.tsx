import React from 'react';
import { cn } from '../../lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'indigo' | 'slate' | 'purple' | 'green' | 'orange' | 'red' | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'indigo',
  size = 'md',
  children,
  ...props
}) => {
  const variantClasses = {
    default: 'bg-slate-800 text-slate-200 border-slate-700',
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    slate: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    green: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
    outline: 'bg-transparent text-slate-300 border-slate-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] font-medium',
    md: 'px-2.5 py-1 text-xs font-semibold',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-xl border transition-colors whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
