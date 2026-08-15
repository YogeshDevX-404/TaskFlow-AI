import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Plus,
  Folder,
  CheckSquare,
  Zap,
  Calendar,
  Map,
  BarChart2,
  Users,
  Clock,
  Briefcase,
  FolderKanban,
  ShieldCheck,
  History,
  Building2,
  Bell,
  User as UserIcon,
  X,
  Filter,
  Trash2,
  SlidersHorizontal,
  ArrowRight,
  CornerDownLeft,
  AlertCircle,
  FileText,
  MessageSquare,
  Paperclip,
  Activity as ActivityIcon,
  Layers,
  Sparkles,
  RefreshCw,
  Tag,
} from 'lucide-react';
import { useUIStore, DashboardTab } from '../../store/useUIStore';
import { useAuthStore } from '../../store/useAuthStore';
import {
  useGlobalSearch,
  useRecentSearches,
  useSaveRecentSearch,
  useClearRecentSearches,
} from '../../hooks/useGlobalSearch';
import { SearchResultItem } from '../../services/api/searchService';

export const CommandPalette: React.FC = () => {
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setCreateTaskModalOpen,
    setCreateProjectModalOpen,
    setActiveTab,
    setSelectedTaskId,
  } = useUIStore();
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [rawInput, setRawInput] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(0);

  // Advanced Filter state
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [taskTypeFilter, setTaskTypeFilter] = useState<string>('');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('relevance');

  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce user input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(rawInput.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [rawInput]);

  // Global Keyboard Shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Focus input when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } else {
      setRawInput('');
      setDebouncedQuery('');
      setSelectedIndex(0);
      setShowFilters(false);
    }
  }, [commandPaletteOpen]);

  // Fetch Global Search
  const searchParams = useMemo(
    () => ({
      q: debouncedQuery,
      category: selectedCategory,
      status: statusFilter,
      priority: priorityFilter,
      taskType: taskTypeFilter,
      dateFilter: dateFilter as any,
      sortBy: sortBy as any,
      limit: 25,
    }),
    [debouncedQuery, selectedCategory, statusFilter, priorityFilter, taskTypeFilter, dateFilter, sortBy]
  );

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    refetch: refetchSearch,
  } = useGlobalSearch(searchParams, commandPaletteOpen && Boolean(debouncedQuery));

  // Recent Searches
  const { data: recentSearches = [] } = useRecentSearches();
  const saveRecentMutation = useSaveRecentSearch();
  const clearRecentMutation = useClearRecentSearches();

  // Command Actions
  const commandActions = useMemo(() => {
    const userName = user ? `${user.firstName} ${user.lastName}`.trim() : 'User';

    const actions = [
      {
        id: 'cmd-create-task',
        title: 'Create Task / Issue',
        type: 'command' as const,
        category: 'Commands',
        description: 'Open task creation modal to log new issue',
        icon: <Plus className="w-4 h-4 text-indigo-500" />,
        action: () => {
          setCreateTaskModalOpen(true);
        },
      },
      {
        id: 'cmd-create-project',
        title: 'Create New Project',
        type: 'command' as const,
        category: 'Commands',
        description: 'Initialize a new project within workspace',
        icon: <Briefcase className="w-4 h-4 text-purple-500" />,
        action: () => {
          setCreateProjectModalOpen(true);
        },
      },
      {
        id: 'cmd-nav-tasks',
        title: 'Open Tasks & Kanban Board',
        type: 'command' as const,
        category: 'Commands',
        description: 'Manage tasks, backlog, and kanban views',
        icon: <CheckSquare className="w-4 h-4 text-emerald-500" />,
        action: () => {
          setActiveTab('tasks');
        },
      },
      {
        id: 'cmd-nav-assignments',
        title: 'Open Work Assignments & Dispatch Hub',
        type: 'command' as const,
        category: 'Commands',
        description: 'Manage work assignments, capacity matrix, and PR review submissions',
        icon: <Briefcase className="w-4 h-4 text-indigo-500" />,
        action: () => {
          setActiveTab('assignments');
        },
      },
      {
        id: 'cmd-nav-sprints',
        title: 'Open Sprints Management',
        type: 'command' as const,
        category: 'Commands',
        description: 'View active sprints, velocity, and backlog',
        icon: <Zap className="w-4 h-4 text-amber-500" />,
        action: () => {
          setActiveTab('sprints');
        },
      },
      {
        id: 'cmd-nav-projects',
        title: 'Open Projects Dashboard',
        type: 'command' as const,
        category: 'Commands',
        description: 'Browse all active projects and progress',
        icon: <Folder className="w-4 h-4 text-blue-500" />,
        action: () => {
          setActiveTab('projects');
        },
      },
      {
        id: 'cmd-nav-workspaces',
        title: 'Open Workspaces Management',
        type: 'command' as const,
        category: 'Commands',
        description: 'Manage workspace settings, members, and visibility',
        icon: <FolderKanban className="w-4 h-4 text-teal-500" />,
        action: () => {
          setActiveTab('workspaces');
        },
      },
      {
        id: 'cmd-nav-reports',
        title: 'Open Executive Reports & Analytics',
        type: 'command' as const,
        category: 'Commands',
        description: 'Project health, burndown, velocity, and team metrics',
        icon: <BarChart2 className="w-4 h-4 text-pink-500" />,
        action: () => {
          setActiveTab('reports');
        },
      },
      {
        id: 'cmd-nav-workload',
        title: 'Open Workload & Capacity Planning',
        type: 'command' as const,
        category: 'Commands',
        description: 'Team member capacity and task allocation',
        icon: <Users className="w-4 h-4 text-cyan-500" />,
        action: () => {
          setActiveTab('workload');
        },
      },
      {
        id: 'cmd-nav-timesheet',
        title: 'Open Timesheets & Time Entries',
        type: 'command' as const,
        category: 'Commands',
        description: 'Log time, review timesheets, and track duration',
        icon: <Clock className="w-4 h-4 text-violet-500" />,
        action: () => {
          setActiveTab('timesheet');
        },
      },
      {
        id: 'cmd-nav-calendar',
        title: 'Open Calendar Schedule',
        type: 'command' as const,
        category: 'Commands',
        description: 'View deadlines, milestones, and events',
        icon: <Calendar className="w-4 h-4 text-rose-500" />,
        action: () => {
          setActiveTab('calendar');
        },
      },
      {
        id: 'cmd-nav-roadmap',
        title: 'Open Product Roadmap',
        type: 'command' as const,
        category: 'Commands',
        description: 'Release timelines and strategic planning',
        icon: <Map className="w-4 h-4 text-orange-500" />,
        action: () => {
          setActiveTab('roadmap');
        },
      },
      {
        id: 'cmd-nav-members',
        title: 'Open Members & Team Directory',
        type: 'command' as const,
        category: 'Commands',
        description: 'Organization members, invites, and roles',
        icon: <Users className="w-4 h-4 text-indigo-400" />,
        action: () => {
          setActiveTab('members');
        },
      },
      {
        id: 'cmd-nav-roles',
        title: 'Open Roles & RBAC Settings',
        type: 'command' as const,
        category: 'Commands',
        description: 'Role-based access controls and permissions',
        icon: <ShieldCheck className="w-4 h-4 text-emerald-400" />,
        action: () => {
          setActiveTab('roles');
        },
      },
      {
        id: 'cmd-nav-audit',
        title: 'Open Audit Logs & System Activity',
        type: 'command' as const,
        category: 'Commands',
        description: 'Security logs, activity history, and audit trail',
        icon: <History className="w-4 h-4 text-slate-400" />,
        action: () => {
          setActiveTab('audit-logs');
        },
      },
      {
        id: 'cmd-nav-orgs',
        title: 'Open Organization Settings',
        type: 'command' as const,
        category: 'Commands',
        description: 'Switch or manage organizations',
        icon: <Building2 className="w-4 h-4 text-blue-400" />,
        action: () => {
          setActiveTab('organizations');
        },
      },
      {
        id: 'cmd-nav-notifications',
        title: 'Open Notification Center',
        type: 'command' as const,
        category: 'Commands',
        description: 'Review system alerts, mentions, and updates',
        icon: <Bell className="w-4 h-4 text-amber-400" />,
        action: () => {
          setActiveTab('notifications');
        },
      },
      {
        id: 'cmd-nav-profile',
        title: `Open Profile Settings (${userName})`,
        type: 'command' as const,
        category: 'Commands',
        description: 'Account settings, password, and preferences',
        icon: <UserIcon className="w-4 h-4 text-slate-300" />,
        action: () => {
          setActiveTab('profile');
        },
      },
    ];

    return actions;
  }, [user, setCreateTaskModalOpen, setCreateProjectModalOpen, setActiveTab]);

  // Combine items depending on query state
  const currentSearchResults = searchData?.results || [];

  const filteredCommands = useMemo(() => {
    if (!debouncedQuery) return commandActions;
    const q = debouncedQuery.toLowerCase();
    return commandActions.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) || cmd.description.toLowerCase().includes(q)
    );
  }, [commandActions, debouncedQuery]);

  // Final display items list
  const displayItems = useMemo(() => {
    if (selectedCategory === 'commands') {
      return filteredCommands.map((c) => ({
        id: c.id,
        title: c.title,
        type: 'command' as const,
        category: 'Commands',
        description: c.description,
        url: '',
        customAction: c.action,
        icon: c.icon,
        updatedAt: new Date().toISOString(),
      }));
    }

    if (!debouncedQuery) {
      // Return commands when no query entered
      return filteredCommands.map((c) => ({
        id: c.id,
        title: c.title,
        type: 'command' as const,
        category: 'Commands',
        description: c.description,
        url: '',
        customAction: c.action,
        icon: c.icon,
        updatedAt: new Date().toISOString(),
      }));
    }

    const items: Array<SearchResultItem & { customAction?: () => void; icon?: React.ReactNode }> = [
      ...currentSearchResults,
    ];

    // Append matching commands if category is 'all'
    if (selectedCategory === 'all' && filteredCommands.length > 0) {
      filteredCommands.slice(0, 5).forEach((c) => {
        items.push({
          id: c.id,
          title: c.title,
          type: 'people' as any, // fallback type
          category: 'Commands',
          description: c.description,
          url: '',
          customAction: c.action,
          icon: c.icon,
          updatedAt: new Date().toISOString(),
        });
      });
    }

    return items;
  }, [debouncedQuery, currentSearchResults, filteredCommands, selectedCategory]);

  // Keyboard Navigation: Up, Down, Enter, Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!commandPaletteOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < displayItems.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : displayItems.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (displayItems.length > 0 && displayItems[selectedIndex]) {
          handleSelectItem(displayItems[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, displayItems, selectedIndex]);

  // Handle selection of a search result or command
  const handleSelectItem = (item: any) => {
    if (item.customAction) {
      item.customAction();
      setCommandPaletteOpen(false);
      return;
    }

    if (debouncedQuery.trim()) {
      saveRecentMutation.mutate({ query: debouncedQuery.trim(), category: selectedCategory });
    }

    // Process navigation based on entity type
    switch (item.type) {
      case 'task': {
        setActiveTab('tasks');
        setSelectedTaskId(item.id);
        break;
      }
      case 'project': {
        setActiveTab('projects');
        break;
      }
      case 'workspace': {
        setActiveTab('workspaces');
        break;
      }
      case 'people': {
        setActiveTab('members');
        break;
      }
      case 'sprint': {
        setActiveTab('sprints');
        break;
      }
      case 'release': {
        setActiveTab('roadmap');
        break;
      }
      case 'comment': {
        setActiveTab('tasks');
        break;
      }
      case 'file': {
        if (item.url && item.url.startsWith('http')) {
          window.open(item.url, '_blank');
        } else {
          setActiveTab('tasks');
        }
        break;
      }
      case 'activity': {
        setActiveTab('audit-logs');
        break;
      }
      case 'organization': {
        setActiveTab('organizations');
        break;
      }
      default: {
        if (item.url) {
          navigate(item.url);
        }
      }
    }

    setCommandPaletteOpen(false);
  };

  // Quick Syntax pill insert handler
  const handleInsertSyntax = (syntax: string) => {
    setRawInput((prev) => `${prev.trim()} ${syntax}`.trim());
    inputRef.current?.focus();
  };

  const getEntityIcon = (type: string, category: string) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="w-4 h-4 text-emerald-500" />;
      case 'project':
        return <Folder className="w-4 h-4 text-blue-500" />;
      case 'workspace':
        return <FolderKanban className="w-4 h-4 text-teal-500" />;
      case 'people':
        return <Users className="w-4 h-4 text-indigo-400" />;
      case 'sprint':
        return <Zap className="w-4 h-4 text-amber-500" />;
      case 'release':
        return <Map className="w-4 h-4 text-orange-500" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-purple-400" />;
      case 'file':
        return <Paperclip className="w-4 h-4 text-pink-500" />;
      case 'activity':
        return <ActivityIcon className="w-4 h-4 text-cyan-400" />;
      case 'organization':
        return <Building2 className="w-4 h-4 text-indigo-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  // Highlighting function
  const renderHighlightedText = (text: string, highlight: string) => {
    if (!highlight || !text) return text;
    const parts = text.split(new RegExp(`(${highlight.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) =>
          part.toLowerCase() === highlight.toLowerCase() ? (
            <mark key={i} className="bg-amber-500/30 text-amber-200 rounded px-0.5 font-semibold">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  const categoriesList = [
    { id: 'all', label: 'All' },
    { id: 'tasks', label: 'Tasks' },
    { id: 'projects', label: 'Projects' },
    { id: 'people', label: 'People' },
    { id: 'workspaces', label: 'Workspaces' },
    { id: 'sprints', label: 'Sprints' },
    { id: 'releases', label: 'Releases' },
    { id: 'comments', label: 'Comments' },
    { id: 'files', label: 'Files' },
    { id: 'activity', label: 'Activity' },
    { id: 'github', label: 'GitHub' },
    { id: 'commands', label: 'Commands' },
  ];

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCommandPaletteOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
          />

          {/* Modal Content Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -12 }}
            className="relative w-full max-w-3xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/90 shadow-2xl z-10 overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[85vh]"
          >
            {/* Search Bar Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center gap-3">
              <Search className="w-5 h-5 text-indigo-500 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search tasks, projects, people, sprints or type 'status:done priority:high'..."
                value={rawInput}
                onChange={(e) => {
                  setRawInput(e.target.value);
                  setSelectedIndex(0);
                }}
                className="w-full bg-transparent text-sm font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              {rawInput && (
                <button
                  onClick={() => setRawInput('')}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  title="Clear input"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition ${
                  showFilters
                    ? 'bg-indigo-600 text-white border-indigo-500'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-slate-400'
                }`}
                title="Toggle Advanced Filters"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(cat.id);
                    setSelectedIndex(0);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cat.label}
                  {searchData?.countsByCategory?.[cat.id] ? (
                    <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {searchData.countsByCategory[cat.id]}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>

            {/* Advanced Filters Panel (Collapsible) */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/50 grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs"
                >
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Status
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">All Statuses</option>
                      <option value="Todo">Todo</option>
                      <option value="In Progress">In Progress</option>
                      <option value="In Review">In Review</option>
                      <option value="Testing">Testing</option>
                      <option value="Done">Done</option>
                      <option value="Backlog">Backlog</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Priority
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">All Priorities</option>
                      <option value="Urgent">Urgent</option>
                      <option value="Highest">Highest</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Lowest">Lowest</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Task Type
                    </label>
                    <select
                      value={taskTypeFilter}
                      onChange={(e) => setTaskTypeFilter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">All Types</option>
                      <option value="Task">Task</option>
                      <option value="Bug">Bug</option>
                      <option value="Story">Story</option>
                      <option value="Epic">Epic</option>
                      <option value="Feature">Feature</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Date Range
                    </label>
                    <select
                      value={dateFilter}
                      onChange={(e) => setDateFilter(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Any Time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="7d">Last 7 Days</option>
                      <option value="30d">Last 30 Days</option>
                      <option value="this_month">This Month</option>
                      <option value="last_month">Last Month</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                      Sort By
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2 py-1 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="relevance">Relevance</option>
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="updated">Recently Updated</option>
                      <option value="alphabetical">Alphabetical</option>
                      <option value="priority">Priority</option>
                    </select>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Syntax Help Bar */}
            <div className="px-4 py-1.5 bg-indigo-500/5 border-b border-indigo-500/10 flex items-center gap-2 overflow-x-auto text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-indigo-500 shrink-0">Search Syntax:</span>
              <button
                onClick={() => handleInsertSyntax('status:done')}
                className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 shrink-0 font-mono"
              >
                status:done
              </button>
              <button
                onClick={() => handleInsertSyntax('priority:high')}
                className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 shrink-0 font-mono"
              >
                priority:high
              </button>
              <button
                onClick={() => handleInsertSyntax('type:bug')}
                className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 shrink-0 font-mono"
              >
                type:bug
              </button>
              <button
                onClick={() => handleInsertSyntax('assignee:me')}
                className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 hover:border-indigo-400 shrink-0 font-mono"
              >
                assignee:me
              </button>
            </div>

            {/* Results / List Viewport */}
            <div className="p-2 overflow-y-auto flex-1 min-h-[300px] max-h-[500px]">
              {/* Recent Searches Section (shown when no query input) */}
              {!rawInput && recentSearches.length > 0 && (
                <div className="mb-4 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" /> Recent Searches
                    </span>
                    <button
                      onClick={() => clearRecentMutation.mutate(undefined)}
                      className="text-[10px] text-slate-500 hover:text-red-400 flex items-center gap-1 transition"
                    >
                      <Trash2 className="w-3 h-3" /> Clear All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((rec) => (
                      <div
                        key={rec.id}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-indigo-500 transition group cursor-pointer"
                      >
                        <span onClick={() => setRawInput(rec.query)}>{rec.query}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            clearRecentMutation.mutate(rec.id);
                          }}
                          className="text-slate-400 hover:text-red-400 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Loading State */}
              {isSearchLoading && (
                <div className="p-8 text-center space-y-3">
                  <RefreshCw className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                  <p className="text-xs text-slate-500">Searching enterprise data stores...</p>
                </div>
              )}

              {/* Error State */}
              {isSearchError && (
                <div className="p-6 text-center space-y-3 bg-red-500/5 rounded-xl border border-red-500/20 my-2">
                  <AlertCircle className="w-6 h-6 text-red-500 mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    Failed to fetch search results from gateway.
                  </p>
                  <button
                    onClick={() => refetchSearch()}
                    className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition"
                  >
                    Retry Search
                  </button>
                </div>
              )}

              {/* Display Results or Commands */}
              {!isSearchLoading && !isSearchError && displayItems.length > 0 && (
                <div className="space-y-1">
                  {displayItems.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={`${item.id}-${idx}`}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition ${
                          isSelected
                            ? 'bg-indigo-600 text-white shadow-md'
                            : 'hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isSelected
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            {item.icon || getEntityIcon(item.type, item.category)}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-xs truncate">
                                {renderHighlightedText(item.title, debouncedQuery)}
                              </span>
                              {item.identifier && (
                                <span
                                  className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                  }`}
                                >
                                  {item.identifier}
                                </span>
                              )}
                              {item.status && (
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-indigo-500/10 text-indigo-500 border border-indigo-500/20'
                                  }`}
                                >
                                  {item.status}
                                </span>
                              )}
                              {item.priority && (
                                <span
                                  className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : item.priority === 'Urgent' || item.priority === 'Highest' || item.priority === 'High'
                                      ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                                      : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                  }`}
                                >
                                  {item.priority}
                                </span>
                              )}
                            </div>

                            {item.description && (
                              <p
                                className={`text-[11px] truncate mt-0.5 ${
                                  isSelected ? 'text-indigo-100' : 'text-slate-500 dark:text-slate-400'
                                }`}
                              >
                                {renderHighlightedText(item.description, debouncedQuery)}
                              </p>
                            )}

                            {item.context?.projectName && (
                              <span
                                className={`text-[10px] block mt-0.5 ${
                                  isSelected ? 'text-indigo-200' : 'text-slate-400'
                                }`}
                              >
                                Project: {item.context.projectName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          {item.assignee?.name && (
                            <span
                              className={`text-[10px] hidden sm:inline-block px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                              }`}
                            >
                              {item.assignee.name}
                            </span>
                          )}
                          <CornerDownLeft
                            className={`w-3.5 h-3.5 transition opacity-0 ${
                              isSelected ? 'opacity-100 text-white' : ''
                            }`}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Empty State */}
              {!isSearchLoading && !isSearchError && displayItems.length === 0 && (
                <div className="p-12 text-center space-y-3">
                  <Search className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    No matching results found for "{rawInput}"
                  </p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Try searching by Task Key (e.g. TASK-101), Project Name, or using syntax like status:done or priority:high.
                  </p>
                </div>
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="p-3 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                    ↑↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                    ↵
                  </kbd>{' '}
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 font-mono text-[10px]">
                    Esc
                  </kbd>{' '}
                  Close
                </span>
              </div>
              <span className="hidden sm:inline font-medium text-indigo-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Enterprise Command Center
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
