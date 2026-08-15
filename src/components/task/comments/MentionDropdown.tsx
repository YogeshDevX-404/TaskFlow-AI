import React, { useEffect, useRef, useState } from 'react';
import { useMemberStore } from '../../../store/useMemberStore';
import { useOrganizationStore } from '../../../store/useOrganizationStore';
import { Check } from 'lucide-react';

interface MentionDropdownProps {
  query: string;
  onSelectUser: (user: { id: string; name: string; email: string; avatar?: string }) => void;
  onClose: () => void;
  style?: React.CSSProperties;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
  query,
  onSelectUser,
  onClose,
  style,
}) => {
  const { members, fetchMembers } = useMemberStore();
  const { activeOrganization } = useOrganizationStore();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeOrganization?.id && members.length === 0) {
      fetchMembers(activeOrganization.id);
    }
  }, [activeOrganization?.id, members.length, fetchMembers]);

  // Filter members based on query
  const filteredMembers = members.filter((m) => {
    const user = m.user;
    if (!user) return false;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    const email = user.email || '';
    const q = query.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q);
  });

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredMembers.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filteredMembers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        const selected = filteredMembers[selectedIndex];
        if (selected && selected.user) {
          const user = selected.user;
          const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
          onSelectUser({
            id: user.id,
            name,
            email: user.email,
            avatar: user.avatar,
          });
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredMembers, selectedIndex, onSelectUser, onClose]);

  if (filteredMembers.length === 0) {
    return (
      <div
        ref={containerRef}
        style={style}
        className="absolute z-50 w-64 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-3 text-xs text-slate-500 dark:text-slate-400"
      >
        No matching members found
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={style}
      className="absolute z-50 w-72 max-h-60 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 text-xs"
    >
      <div className="px-3 py-1.5 font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-slate-800">
        Mention Member
      </div>
      {filteredMembers.map((m, idx) => {
        const user = m.user;
        if (!user) return null;
        const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
        const isSelected = idx === selectedIndex;

        return (
          <button
            key={m.id || user.id}
            type="button"
            onClick={() =>
              onSelectUser({
                id: user.id,
                name,
                email: user.email,
                avatar: user.avatar,
              })
            }
            onMouseEnter={() => setSelectedIndex(idx)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors ${
              isSelected
                ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            }`}
          >
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={name}
                className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-semibold text-[10px]">
                {name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{name}</div>
              <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                {user.email}
              </div>
            </div>
            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
          </button>
        );
      })}
    </div>
  );
};
