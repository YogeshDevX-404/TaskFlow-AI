import React from 'react';
import { useTypingStore } from '../../store/useTypingStore';

export interface TypingIndicatorProps {
  roomId: string;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ roomId, className = '' }) => {
  const getTypingInRoom = useTypingStore((state) => state.getTypingInRoom);
  const typingUsers = getTypingInRoom(roomId);

  if (!typingUsers || typingUsers.length === 0) return null;

  const names = typingUsers.map((u) => u.userName).join(', ');

  return (
    <div className={`flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium py-1.5 px-2 animate-in fade-in duration-200 ${className}`}>
      <div className="flex -space-x-1.5 overflow-hidden">
        {typingUsers.map((u) => (
          <div key={u.userId} className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
            {u.userAvatar ? (
              <img src={u.userAvatar} alt={u.userName} className="w-full h-full rounded-full object-cover" />
            ) : (
              u.userName.charAt(0)
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center gap-1.5">
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          {names} {typingUsers.length === 1 ? 'is' : 'are'} typing
        </span>
        <span className="flex gap-0.5 items-center">
          <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </span>
      </div>
    </div>
  );
};
