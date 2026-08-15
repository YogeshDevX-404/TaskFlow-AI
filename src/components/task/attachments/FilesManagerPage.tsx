import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FolderOpen,
  Upload,
  Search,
  Filter,
  RefreshCw,
  Trash2,
  Download,
  Eye,
  FileText,
  Clock,
  Layers,
  Sparkles,
  Edit2,
  FileIcon,
  Activity,
  User,
  SlidersHorizontal,
} from 'lucide-react';
import { AttachmentApiService } from '../../../services/api/attachmentService';
import { ProjectService } from '../../../services/api/projectService';
import { axiosInstance } from '../../../services/api/axiosInstance';
import { useAuthStore } from '../../../store/useAuthStore';
import { Attachment, AttachmentCategory } from '../../../types/attachment';
import { AttachmentDropzone } from './AttachmentDropzone';
import { AttachmentCard, formatFileSize } from './AttachmentCard';
import { AttachmentPreviewDrawer } from './AttachmentPreviewDrawer';

export const FilesManagerPage: React.FC = () => {
  const { user } = useAuthStore();
  const organizationId = (user as any)?.organizationId || '';
  const queryClient = useQueryClient();

  const [activeView, setActiveView] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AttachmentCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'largest' | 'smallest' | 'alphabetical'>('newest');
  const [showUpload, setShowUpload] = useState(false);
  const [previewFile, setPreviewFile] = useState<Attachment | null>(null);
  const [selectedTask, setSelectedTask] = useState('');

  // Dropdown option queries
  const { data: projects = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await ProjectService.getProjects();
      return res.data || [];
    },
  });

  const { data: members = [] } = useQuery({
    queryKey: ['members'],
    queryFn: async () => {
      try {
        const res = await axiosInstance.get('/users');
        return res?.data?.data || res?.data || [];
      } catch (e) {
        return [];
      }
    },
  });

  // Query files
  const { data: files = [], isLoading, refetch } = useQuery<Attachment[]>({
    queryKey: ['files', organizationId, selectedProject, selectedCategory, sortBy, searchQuery, selectedTask],
    queryFn: async () => {
      const res = await AttachmentApiService.getTaskAttachments('', {
        category: selectedCategory,
        search: searchQuery,
        sortBy: sortBy,
        organizationId,
        projectId: selectedProject || undefined,
        taskId: selectedTask || undefined,
      } as any);
      return (res.data as any) || [];
    },
  });

  // Rename Mutation
  const renameMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) =>
      AttachmentApiService.updateAttachment(id, { fileName: newName }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => AttachmentApiService.deleteAttachment(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setPreviewFile(null);
    },
  });

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['files'] });
    setShowUpload(false);
  };

  const handleDownload = async (file: Attachment) => {
    try {
      const res = await AttachmentApiService.getDownloadUrl(file.id);
      const url = res.data?.fileUrl || file.fileUrl;
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      window.open(file.fileUrl, '_blank');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              Files Manager
            </span>
            <span className="text-xs text-slate-400">• Dynamic Storage</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight mt-1">
            Enterprise Documents Repository
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Access, view, preview, download, and delete attachments associated with tasks and projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            {showUpload ? 'Hide Upload' : 'Upload Files'}
          </button>
        </div>
      </div>

      {/* Upload Dropzone */}
      {showUpload && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-100 mb-3">Upload new documents</h3>
          <AttachmentDropzone
            onFilesSelected={async (filesList) => {
              if (filesList.length === 0) return;
              // File manager uploads must be associated with a project/task context. Default to first project's dummy/backlog task or workspace default task if exists.
              const defaultTaskId = files[0]?.task || 'task-default';
              const formData = new FormData();
              filesList.forEach((f) => formData.append('files', f));
              try {
                await AttachmentApiService.uploadTaskAttachments(defaultTaskId, formData);
                handleUploadSuccess();
              } catch (e) {
                console.error(e);
              }
            }}
          />
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search file name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Project */}
          <div>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Projects</option>
              {projects.map((p: any) => (
                <option key={p.id || p._id} value={p.id || p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Category */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">All File Types</option>
              <option value="image">Images</option>
              <option value="document">Documents</option>
              <option value="video">Videos</option>
              <option value="audio">Audios</option>
              <option value="archive">Archives</option>
              <option value="other">Others</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="newest">Newest Uploaded</option>
              <option value="oldest">Oldest Uploaded</option>
              <option value="largest">Largest Size</option>
              <option value="smallest">Smallest Size</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              className="w-full py-2 px-3 rounded-lg bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Main Files Display */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mb-2" />
          <span className="text-xs text-slate-500">Loading documents...</span>
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-center">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200">No documents found</h3>
          <p className="text-xs text-slate-500 max-w-sm mt-1">
            There are no documents uploaded matching your selected filters. Try uploading some.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <div
              key={file.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:shadow-md transition-shadow relative group"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-indigo-600 shrink-0">
                  <FileIcon className="w-5 h-5" />
                </div>
                <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPreviewFile(file)}
                    className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:text-indigo-600"
                    title="Preview"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDownload(file)}
                    className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:text-indigo-600"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this file?')) {
                        deleteMutation.mutate(file.id);
                      }
                    }}
                    className="p-1 rounded-md bg-slate-100 dark:bg-slate-800 hover:text-rose-600"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate" title={file.fileName}>
                  {file.fileName}
                </h4>
                <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                </div>
                {file.uploadedBy && (
                  <div className="mt-2 flex items-center gap-1.5 text-[10px] text-slate-500">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>{(file.uploadedBy as any).name || 'Uploader'}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview drawer */}
      {previewFile && (
        <AttachmentPreviewDrawer
          attachment={previewFile}
          onClose={() => setPreviewFile(null)}
          onDownload={() => handleDownload(previewFile)}
          onRename={(newName) => renameMutation.mutate({ id: previewFile.id, newName })}
          onReplace={(f) => {
            const formData = new FormData();
            formData.append('file', f);
            formData.append('action', 'replace');
            AttachmentApiService.updateAttachment(previewFile.id, formData).then(() => {
              queryClient.invalidateQueries({ queryKey: ['files'] });
              setPreviewFile(null);
            });
          }}
          onDelete={() => {
            if (confirm('Are you sure you want to delete this file?')) {
              deleteMutation.mutate(previewFile.id);
            }
          }}
        />
      )}
    </div>
  );
};
