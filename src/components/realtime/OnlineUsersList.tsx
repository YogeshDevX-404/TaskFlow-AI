import React, { useState } from 'react';
import { usePresenceStore } from '../../store/usePresenceStore';
import { Users, Circle, Clock } from 'lucide-react';

export const OnlineUsersList: React.FC = () => {
  const onlineUsersMap = usePresenceStore((state) => state.onlineUsers);
  const users = Array.from(onlineUsersMap.values());
  const [isOpen, setIsOpen] = useState(false);

  const onlineUsers = users.filter((u) => u.status === 'online');
  const offlineUsers = users.filter((u) => u.status !== 'online');

  return (
    <div className="relative">
      {/* Trigger Button with Avatars Stack */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition cursor-pointer"
        title="Active Team Presence"
      >
        <div className="flex -space-x-2 overflow-hidden">
          {onlineUsers.slice(0, 3).map((u) => (
            <div key={u.userId} className="relative inline-block">
              {u.avatar ? (
                <img
                  src={u.avatar}
                  alt={u.name}
                  className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white font-bold text-[9px] flex items-center justify-center ring-2 ring-white dark:ring-slate-900">
                  {u.name?.charAt(0) || 'U'}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-slate-900" />
            </div>
          ))}
          {onlineUsers.length === 0 && (
            <Users className="w-4 h-4 text-slate-400" />
          )}
        </div>

        <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
          {onlineUsers.length} <span className="hidden md:inline font-normal text-slate-500">Active</span>
        </span>
      </button>

      {/* Dropdown Modal */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-500" />
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Team Presence ({onlineUsers.length} Online)
                </h4>
              </div>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1 text-xs">
              {onlineUsers.length === 0 && offlineUsers.length === 0 ? (
                <p className="p-3 text-center text-slate-400 text-[11px]">No active presence detected</p>
              ) : (
                <>
                  {onlineUsers.map((u) => (
                    <div
                      key={u.userId}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center">
                              {u.name?.charAt(0)}
                            </div>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                        </div>
                      </div>

                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        Active Now
                      </span>
                    </div>
                  ))}

                  {offlineUsers.map((u) => (
                    <div
                      key={u.userId}
                      className="flex items-center justify-between p-2 rounded-xl opacity-60 hover:opacity-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="relative shrink-0">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover grayscale" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-slate-400 text-white font-bold text-xs flex items-center justify-center">
                              {u.name?.charAt(0)}
                            </div>
                          )}
                          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-slate-400 ring-2 ring-white dark:ring-slate-900" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{u.name}</p>
                          <p className="text-[10px] text-slate-400 truncate">Offline</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
                        <Clock className="w-2.5 h-2.5" /> Offline
                      </span>
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
