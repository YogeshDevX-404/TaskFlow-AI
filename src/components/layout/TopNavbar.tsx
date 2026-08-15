import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Plus, Bell, Sparkles, Menu, LogOut, User, Settings, Layers } from 'lucide-react';
import { useUIStore } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../ui/Button';
import { ThemeToggle } from '../common/ThemeToggle';
import { Avatar } from '../ui/Avatar';
import { Dropdown } from '../ui/Dropdown';

export const TopNavbar: React.FC = () => {
  const { setCommandPaletteOpen, setCreateTaskModalOpen, setMobileMenuOpen, mobileMenuOpen, setAiDrawerOpen } =
    useUIStore();
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : 'TaskFlow User';

  const userDropdownItems = [
    {
      id: 'profile',
      label: 'My Profile',
      icon: <User className="w-4 h-4" />,
      onClick: () => navigate('/app/profile'),
    },
    {
      id: 'settings',
      label: 'Workspace Settings',
      icon: <Settings className="w-4 h-4" />,
      onClick: () => navigate('/app/settings'),
    },
    {
      id: 'logout',
      label: 'Log out',
      icon: <LogOut className="w-4 h-4" />,
      danger: true,
      onClick: () => {
        logout();
        navigate('/login');
      },
    },
  ];

  return (
    <header className="sticky top-0 z-20 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Trigger */}
        <button
          onClick={() => setCommandPaletteOpen(true)}
          className="flex items-center gap-3 w-48 sm:w-72 h-9 px-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/50 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-xs"
        >
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="truncate">Search tasks, projects, repos...</span>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[10px] font-mono text-slate-400 ml-auto">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Button
          onClick={() => setCreateTaskModalOpen(true)}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          className="hidden sm:inline-flex"
        >
          Create Issue
        </Button>

        <button
          onClick={() => setAiDrawerOpen(true)}
          className="p-2 rounded-xl text-purple-500 hover:bg-purple-500/10 transition-colors"
          title="Open AI Assistant"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
        </button>

        <Link
          to="/app/notifications"
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-900" />
        </Link>

        <ThemeToggle />

        <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1 hidden sm:block" />

        <Dropdown
          align="right"
          trigger={<Avatar src={user?.avatar} name={userName} status="online" size="md" />}
          items={userDropdownItems}
        />
      </div>
    </header>
  );
};
