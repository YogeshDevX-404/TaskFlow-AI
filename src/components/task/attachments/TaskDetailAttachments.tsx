import React, { useState } from 'react';
import { Paperclip, Upload, X, RefreshCw, AlertCircle, CheckCircle2, FileIcon } from 'lucide-react';
import { useAttachments, useDownloadAttachment } from '../../../hooks/useAttachments';
import { AttachmentDropzone } from './AttachmentDropzone';
import { AttachmentFilterBar } from './AttachmentFilterBar';
import { AttachmentCard, formatFileSize } from './AttachmentCard';
import { AttachmentPreviewDrawer } from './AttachmentPreviewDrawer';
import { Attachment } from '../../../types/attachment';

interface TaskDetailAttachmentsProps {
  taskId: string;
}

export const TaskDetailAttachments: React.FC<TaskDetailAttachmentsProps> = ({ taskId }) => {
  const {
    attachments,
    loading,
    error,
    filters,
    viewMode,
    previewAttachment,
    uploadQueue,
    uploadFiles,
    cancelUpload,
    retryUpload,
    renameAttachment,
    replaceAttachment,
    deleteAttachment,
    setCategoryFilter,
    setSearchQuery,
    setSortBy,
    setViewMode,
    setPreviewAttachment,
  } = useAttachments(taskId);

  const { downloadAttachment } = useDownloadAttachment();
  const [showDropzone, setShowDropzone] = useState(false);

  // Filter attachments on the client side for instant responsive feel
  const filteredAttachments = attachments.filter((att) => {
    // Category filter
    if (filters.category && filters.category !== 'all') {
      if (att.fileType !== filters.category) return false;
    }
    // Search query
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const matchName = att.fileName.toLowerCase().includes(q) || att.originalName.toLowerCase().includes(q);
      if (!matchName) return false;
    }
    return true;
  });

  // Sort attachments
  const sortedAttachments = [...filteredAttachments].sort((a, b) => {
    switch (filters.sortBy) {
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'largest':
        return b.fileSize - a.fileSize;
      case 'smallest':
        return a.fileSize - b.fileSize;
      case 'alphabetical':
        return a.fileName.localeCompare(b.fileName);
      case 'newest':
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100">
            Attachments ({attachments.length})
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowDropzone(!showDropzone)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-2xs"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>{showDropzone ? 'Hide Upload' : 'Upload File'}</span>
        </button>
      </div>

      {/* Upload Dropzone (Collapsible or Always Active when toggled) */}
      {showDropzone && (
        <AttachmentDropzone
          onFilesSelected={(files) => {
            uploadFiles(files);
          }}
        />
      )}

      {/* Active Upload Queue Section */}
      {uploadQueue.length > 0 && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/60 p-3 space-y-2 text-xs">
          <div className="font-medium text-slate-700 dark:text-slate-300 flex items-center justify-between">
            <span>Uploading Files ({uploadQueue.filter((q) => q.status === 'completed').length}/{uploadQueue.length})</span>
          </div>

          <div className="space-y-2">
            {uploadQueue.map((item) => (
              <div
                key={item.id}
                className="p-2.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1.5"
              >
                <div className="flex items-center justify-between min-w-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileIcon className="w-4 h-4 text-blue-500 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                      {item.fileName}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({formatFileSize(item.fileSize)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {item.status === 'uploading' && (
                      <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        {item.progress}%
                      </span>
                    )}

                    {item.status === 'completed' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
                      </span>
                    )}

                    {item.status === 'error' && (
                      <button
                        type="button"
                        onClick={() => retryUpload(item.id)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-[10px] font-medium hover:bg-amber-100"
                        title="Retry upload"
                      >
                        <RefreshCw className="w-3 h-3" /> Retry
                      </button>
                    )}

                    {item.status === 'pending' || item.status === 'uploading' ? (
                      <button
                        type="button"
                        onClick={() => cancelUpload(item.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        title="Cancel upload"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    ) : null}
                  </div>
                </div>

                {/* Progress Bar */}
                {item.status === 'uploading' && (
                  <div className="w-full bg-slate-100 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-200"
                      style={{ width: `${item.progress}%` }}
                    />
                  </div>
                )}

                {item.status === 'error' && (
                  <div className="text-[11px] text-red-600 dark:text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    <span>{item.error || 'Upload failed'}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter and View Mode Controls */}
      {attachments.length > 0 && (
        <AttachmentFilterBar
          selectedCategory={filters.category || 'all'}
          searchQuery={filters.search || ''}
          sortBy={filters.sortBy || 'newest'}
          viewMode={viewMode}
          onCategoryChange={setCategoryFilter}
          onSearchChange={setSearchQuery}
          onSortChange={setSortBy}
          onViewModeChange={setViewMode}
          totalCount={attachments.length}
        />
      )}

      {/* Skeleton Loading */}
      {loading && attachments.length === 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-28 rounded-xl bg-slate-100 dark:bg-slate-800 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && sortedAttachments.length === 0 && (
        <div className="text-center py-8 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 text-slate-400 space-y-2">
          <Paperclip className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600" />
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {attachments.length === 0
              ? 'No attachments uploaded yet'
              : 'No attachments match the selected filters'}
          </p>
          {attachments.length === 0 && !showDropzone && (
            <button
              type="button"
              onClick={() => setShowDropzone(true)}
              className="text-xs text-blue-600 dark:text-blue-400 font-medium underline underline-offset-2"
            >
              Upload a file to get started
            </button>
          )}
        </div>
      )}

      {/* Attachments List / Grid */}
      {sortedAttachments.length > 0 && (
        <div
          className={
            viewMode === 'list'
              ? 'space-y-2'
              : viewMode === 'thumbnail'
              ? 'grid grid-cols-2 sm:grid-cols-3 gap-3'
              : 'grid grid-cols-2 sm:grid-cols-3 gap-3'
          }
        >
          {sortedAttachments.map((att) => (
            <AttachmentCard
              key={att.id}
              attachment={att}
              viewMode={viewMode}
              onPreview={setPreviewAttachment}
              onDownload={downloadAttachment}
              onRename={renameAttachment}
              onReplace={replaceAttachment}
              onDelete={deleteAttachment}
            />
          ))}
        </div>
      )}

      {/* Preview Modal / Drawer */}
      <AttachmentPreviewDrawer
        attachment={previewAttachment}
        onClose={() => setPreviewAttachment(null)}
        onDownload={downloadAttachment}
      />
    </div>
  );
};
