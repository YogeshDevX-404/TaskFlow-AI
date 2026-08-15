import React from 'react';
import { cn } from '../../lib/utils';

export interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'busy' | 'offline';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({ src, name = 'User', size = 'md', status, className }) => {
  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-11 h-11 text-base',
    xl: 'w-14 h-14 text-lg font-bold',
  };

  const statusClasses = {
    online: 'bg-emerald-500',
    busy: 'bg-amber-500',
    offline: 'bg-slate-400',
  };

  const initials = name
    ? name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover border border-slate-200 dark:border-slate-800 shadow-xs',
            sizeClasses[size],
            className
          )}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-indigo-600/20 text-indigo-400 font-semibold border border-indigo-500/30 flex items-center justify-center select-none',
            sizeClasses[size],
            className
          )}
        >
          {initials}
        </div>
      )}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900',
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
};
