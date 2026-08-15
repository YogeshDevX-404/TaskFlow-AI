import React, { useState, useRef, useEffect } from 'react';
import { CommentReaction } from '../../../types/comment';
import { Smile, Plus } from 'lucide-react';

interface ReactionBarProps {
  reactions: CommentReaction[];
  onToggleReaction: (emoji: string) => void;
  disabled?: boolean;
}

const EMOJI_OPTIONS = ['👍', '❤️', '🔥', '🚀', '🎉', '👀'];

export const ReactionBar: React.FC<ReactionBarProps> = ({
  reactions = [],
  onToggleReaction,
  disabled = false,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false);
      }
    };
    if (showPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPicker]);

  const activeReactions = reactions.filter((r) => r.count > 0);

  return (
    <div className="flex items-center flex-wrap gap-1.5 mt-2">
      {activeReactions.map((r) => (
        <button
          key={r.emoji}
          type="button"
          disabled={disabled}
          onClick={() => onToggleReaction(r.emoji)}
          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-all ${
            r.hasReacted
              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400'
              : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <span>{r.emoji}</span>
          <span className="text-[11px] font-semibold">{r.count}</span>
        </button>
      ))}

      <div className="relative inline-block" ref={pickerRef}>
        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowPicker(!showPicker)}
          className="inline-flex items-center justify-center w-6 h-6 rounded-full border border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-400 dark:hover:border-slate-600 transition-colors text-xs"
          title="Add reaction"
        >
          <Smile className="w-3.5 h-3.5" />
        </button>

        {showPicker && (
          <div className="absolute left-0 bottom-full mb-1 z-50 flex items-center gap-1 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full shadow-lg animate-in fade-in zoom-in-95 duration-100">
            {EMOJI_OPTIONS.map((emoji) => {
              const current = reactions.find((r) => r.emoji === emoji);
              const hasReacted = current?.hasReacted;

              return (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => {
                    onToggleReaction(emoji);
                    setShowPicker(false);
                  }}
                  className={`w-7 h-7 flex items-center justify-center rounded-full text-base hover:scale-125 transition-transform ${
                    hasReacted ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                  title={`React with ${emoji}`}
                >
                  {emoji}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
