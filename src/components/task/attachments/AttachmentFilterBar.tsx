import React from 'react';
import {
  Search,
  Grid,
  List,
  LayoutGrid,
  FileImage,
  FileText,
  Video,
  Music,
  Archive,
  Layers,
  ArrowUpDown,
} from 'lucide-react';
import {
  AttachmentCategory,
  AttachmentSortBy,
  AttachmentViewMode,
} from '../../../types/attachment';

interface AttachmentFilterBarProps {
  selectedCategory: AttachmentCategory | 'all';
  searchQuery: string;
  sortBy: AttachmentSortBy;
  viewMode: AttachmentViewMode;
  onCategoryChange: (cat: AttachmentCategory | 'all') => void;
  onSearchChange: (q: string) => void;
  onSortChange: (sort: AttachmentSortBy) => void;
  onViewModeChange: (mode: AttachmentViewMode) => void;
  totalCount: number;
}

const CATEGORIES: { id: AttachmentCategory | 'all'; label: string; icon: React.FC<{ className?: string }> }[] = [
  { id: 'all', label: 'All', icon: Layers },
  { id: 'image', label: 'Images', icon: FileImage },
  { id: 'document', label: 'Docs', icon: FileText },
  { id: 'video', label: 'Videos', icon: Video },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'archive', label: 'Archives', icon: Archive },
];

export const AttachmentFilterBar: React.FC<AttachmentFilterBarProps> = ({
  selectedCategory,
  searchQuery,
  sortBy,
  viewMode,
  onCategoryChange,
  onSearchChange,
  onSortChange,
  onViewModeChange,
  totalCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Category Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Search, Sort, View mode switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[180px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search attachments..."
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Sort Selector */}
          <div className="relative inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 text-xs text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as AttachmentSortBy)}
              className="bg-transparent text-xs text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="largest">Size: High to Low</option>
              <option value="smallest">Size: Low to High</option>
              <option value="alphabetical">A-Z Name</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-md text-slate-600 dark:text-slate-300 transition-colors ${
                viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow-2xs text-blue-600 dark:text-blue-400 font-semibold' : 'hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('thumbnail')}
              className={`p-1.5 rounded-md text-slate-600 dark:text-slate-300 transition-colors ${
                viewMode === 'thumbnail' ? 'bg-white dark:bg-slate-900 shadow-2xs text-blue-600 dark:text-blue-400 font-semibold' : 'hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
              title="Thumbnail View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('list')}
              className={`p-1.5 rounded-md text-slate-600 dark:text-slate-300 transition-colors ${
                viewMode === 'list' ? 'bg-white dark:bg-slate-900 shadow-2xs text-blue-600 dark:text-blue-400 font-semibold' : 'hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
              }`}
              title="List View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
