import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Map,
  Kanban,
  Tag,
  TrendingUp,
  Search,
  Filter,
  Plus,
  Rocket,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useRoadmap } from '../../hooks/useRoadmap';
import { useReleases } from '../../hooks/useReleases';
import { RoadmapMetricsBanner } from './RoadmapMetricsBanner';
import { RoadmapTimelineView } from './RoadmapTimelineView';
import { ReleaseBoardView } from './ReleaseBoardView';
import { ReleaseModal } from './ReleaseModal';
import { VersionManagementModal } from './VersionManagementModal';
import { MilestoneTracker } from '../calendar/MilestoneTracker';
import { Release } from '../../types/release';
import { useProjectStore } from '../../store/useProjectStore';

export const RoadmapPage: React.FC = () => {
  const {
    roadmapData,
    viewMode,
    zoomLevel,
    filters,
    isLoading: roadmapLoading,
    fetchRoadmapData,
    setViewMode,
    setZoomLevel,
    setFilters: setRoadmapFilters,
    updateReleaseTimelineDates,
  } = useRoadmap(true);

  const {
    releases,
    createRelease,
    updateRelease,
    deleteRelease,
    archiveRelease,
    duplicateRelease,
    fetchReleases,
  } = useReleases(true);

  const { projects } = useProjectStore();

  const [activeTab, setActiveTab] = useState<'timeline' | 'board' | 'versions' | 'analytics'>('timeline');

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [releaseToEdit, setReleaseToEdit] = useState<Release | null>(null);

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);

  const handleOpenCreateRelease = () => {
    setReleaseToEdit(null);
    setIsReleaseModalOpen(true);
  };

  const handleOpenEditRelease = (release: Release) => {
    setReleaseToEdit(release);
    setIsReleaseModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    setRoadmapFilters({ searchQuery: q });
  };

  const handleProjectFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const pId = e.target.value;
    setSelectedProjectId(pId);
    setRoadmapFilters({ projectId: pId });
  };

  const handleSaveRelease = async (data: any) => {
    if (releaseToEdit) {
      await updateRelease(releaseToEdit.id, data);
    } else {
      await createRelease(data);
    }
    await fetchRoadmapData();
    await fetchReleases();
  };

  const handleDeleteRelease = async (id: string) => {
    await deleteRelease(id);
    await fetchRoadmapData();
    await fetchReleases();
  };

  const handleDuplicateRelease = async (id: string) => {
    await duplicateRelease(id);
    await fetchRoadmapData();
    await fetchReleases();
  };

  const handleArchiveRelease = async (id: string, isArchived: boolean) => {
    await archiveRelease(id, isArchived);
    await fetchRoadmapData();
    await fetchReleases();
  };

  const activeReleases = releases.filter((r) => {
    if (selectedProjectId && (typeof r.project === 'object' ? r.project?.id : r.project) !== selectedProjectId) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.version.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-2xs font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 uppercase tracking-wider">
              Enterprise Suite
            </span>
            <span className="text-2xs text-slate-400 font-semibold">• Roadmap & Delivery Planning</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2.5">
            <Map className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
            Product Roadmap & Releases
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
            Multi-project version delivery roadmap, release board, milestone tracking, and goal planning similar to Jira Advanced Roadmaps & Linear.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsVersionModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2"
          >
            <Tag className="w-4 h-4 text-indigo-500" />
            Manage Versions
          </button>

          <button
            onClick={handleOpenCreateRelease}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Release
          </button>
        </div>
      </div>

      {/* Metrics Banner */}
      {roadmapData?.summary && <RoadmapMetricsBanner summary={roadmapData.summary} />}

      {/* Filter & View Tabs Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'timeline'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Map className="w-4 h-4" />
            Roadmap Timeline
          </button>
          <button
            onClick={() => setActiveTab('board')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'board'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Kanban className="w-4 h-4" />
            Release Board
          </button>
          <button
            onClick={() => setActiveTab('versions')}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${
              activeTab === 'versions'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4" />
            Milestone Tracker
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Filter releases or versions..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Project Filter */}
          <select
            value={selectedProjectId}
            onChange={handleProjectFilterChange}
            className="px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              fetchRoadmapData();
              fetchReleases();
            }}
            className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
            title="Refresh Roadmap Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {activeTab === 'timeline' && (
        <RoadmapTimelineView
          releases={activeReleases}
          viewMode={viewMode}
          zoomLevel={zoomLevel}
          onChangeViewMode={setViewMode}
          onChangeZoomLevel={setZoomLevel}
          onSelectRelease={handleOpenEditRelease}
          onUpdateDates={updateReleaseTimelineDates}
        />
      )}

      {activeTab === 'board' && (
        <ReleaseBoardView
          releases={activeReleases}
          onEditRelease={handleOpenEditRelease}
          onDuplicateRelease={handleDuplicateRelease}
          onArchiveRelease={handleArchiveRelease}
          onDeleteRelease={handleDeleteRelease}
          onOpenCreateModal={handleOpenCreateRelease}
        />
      )}

      {activeTab === 'versions' && <MilestoneTracker />}

      {/* Modals */}
      <ReleaseModal
        isOpen={isReleaseModalOpen}
        onClose={() => setIsReleaseModalOpen(false)}
        releaseToEdit={releaseToEdit}
        onSave={handleSaveRelease}
        onDelete={handleDeleteRelease}
        onDuplicate={handleDuplicateRelease}
        onArchive={handleArchiveRelease}
      />

      <VersionManagementModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
      />
    </div>
  );
};
