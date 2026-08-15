import { create } from 'zustand';
import {
  Attachment,
  AttachmentCategory,
  AttachmentFilterOptions,
  AttachmentSortBy,
  AttachmentViewMode,
  UploadQueueItem,
} from '../types/attachment';
import { AttachmentApiService } from '../services/api/attachmentService';

interface AttachmentState {
  attachments: Attachment[];
  loading: boolean;
  error: string | null;
  filters: AttachmentFilterOptions;
  viewMode: AttachmentViewMode;
  previewAttachment: Attachment | null;
  uploadQueue: UploadQueueItem[];

  // Actions
  fetchAttachments: (taskId: string) => Promise<void>;
  uploadFiles: (taskId: string, files: File[]) => Promise<void>;
  cancelUpload: (uploadId: string) => void;
  retryUpload: (taskId: string, uploadId: string) => Promise<void>;
  renameAttachment: (attachmentId: string, newName: string) => Promise<void>;
  replaceAttachment: (attachmentId: string, file: File) => Promise<void>;
  deleteAttachment: (attachmentId: string) => Promise<void>;
  setCategoryFilter: (category: AttachmentCategory | 'all') => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sortBy: AttachmentSortBy) => void;
  setViewMode: (mode: AttachmentViewMode) => void;
  setPreviewAttachment: (attachment: Attachment | null) => void;
  clearUploadQueue: () => void;
}

function getCategoryFromFile(file: File): AttachmentCategory {
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  const mime = file.type;

  if (mime.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['.mp4', '.mov', '.avi', '.webm'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['.mp3', '.wav', '.ogg'].includes(ext)) {
    return 'audio';
  }
  if (mime.includes('zip') || mime.includes('rar') || ['.zip', '.rar', '.7z'].includes(ext)) {
    return 'archive';
  }
  if (
    mime.includes('pdf') ||
    mime.includes('word') ||
    mime.includes('excel') ||
    mime.includes('text') ||
    ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.csv'].includes(ext)
  ) {
    return 'document';
  }
  return 'other';
}

export const useAttachmentStore = create<AttachmentState>((set, get) => ({
  attachments: [],
  loading: false,
  error: null,
  filters: {
    category: 'all',
    search: '',
    sortBy: 'newest',
  },
  viewMode: 'grid',
  previewAttachment: null,
  uploadQueue: [],

  fetchAttachments: async (taskId: string) => {
    if (!taskId) return;
    set({ loading: true, error: null });
    try {
      const response = await AttachmentApiService.getTaskAttachments(taskId, get().filters);
      if (response.success && response.data) {
        set({ attachments: response.data, loading: false });
      } else {
        set({ error: response.message || 'Failed to load attachments', loading: false });
      }
    } catch (err: any) {
      set({ error: err.message || 'Error fetching attachments', loading: false });
    }
  },

  uploadFiles: async (taskId: string, files: File[]) => {
    if (!taskId || files.length === 0) return;

    // Build upload queue items
    const newItems: UploadQueueItem[] = files.map((file) => ({
      id: `up_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: getCategoryFromFile(file),
      progress: 0,
      status: 'pending',
    }));

    set((state) => ({ uploadQueue: [...state.uploadQueue, ...newItems] }));

    for (const item of newItems) {
      const currentQueueItem = get().uploadQueue.find((q) => q.id === item.id);
      if (currentQueueItem?.status === 'cancelled') continue;

      set((state) => ({
        uploadQueue: state.uploadQueue.map((q) =>
          q.id === item.id ? { ...q, status: 'uploading', progress: 10 } : q
        ),
      }));

      try {
        const formData = new FormData();
        formData.append('files', item.file);

        const res = await AttachmentApiService.uploadTaskAttachments(
          taskId,
          formData,
          (percent) => {
            set((state) => ({
              uploadQueue: state.uploadQueue.map((q) =>
                q.id === item.id ? { ...q, progress: percent } : q
              ),
            }));
          }
        );

        if (res.success && res.data) {
          const uploadedItems = Array.isArray(res.data) ? res.data : [res.data];

          set((state) => ({
            uploadQueue: state.uploadQueue.map((q) =>
              q.id === item.id ? { ...q, progress: 100, status: 'completed' } : q
            ),
            attachments: [...uploadedItems, ...state.attachments],
          }));
        } else {
          set((state) => ({
            uploadQueue: state.uploadQueue.map((q) =>
              q.id === item.id ? { ...q, status: 'error', error: res.message || 'Upload failed' } : q
            ),
          }));
        }
      } catch (err: any) {
        set((state) => ({
          uploadQueue: state.uploadQueue.map((q) =>
            q.id === item.id ? { ...q, status: 'error', error: err.message || 'Upload failed' } : q
          ),
        }));
      }
    }
  },

  cancelUpload: (uploadId: string) => {
    set((state) => ({
      uploadQueue: state.uploadQueue.map((q) =>
        q.id === uploadId ? { ...q, status: 'cancelled' } : q
      ),
    }));
  },

  retryUpload: async (taskId: string, uploadId: string) => {
    const item = get().uploadQueue.find((q) => q.id === uploadId);
    if (!item) return;

    set((state) => ({
      uploadQueue: state.uploadQueue.map((q) =>
        q.id === uploadId ? { ...q, status: 'uploading', progress: 10, error: undefined } : q
      ),
    }));

    try {
      const formData = new FormData();
      formData.append('file', item.file);

      const res = await AttachmentApiService.uploadTaskAttachments(
        taskId,
        formData,
        (percent) => {
          set((state) => ({
            uploadQueue: state.uploadQueue.map((q) =>
              q.id === uploadId ? { ...q, progress: percent } : q
            ),
          }));
        }
      );

      if (res.success && res.data) {
        const uploadedItems = Array.isArray(res.data) ? res.data : [res.data];
        set((state) => ({
          uploadQueue: state.uploadQueue.map((q) =>
            q.id === uploadId ? { ...q, progress: 100, status: 'completed' } : q
          ),
          attachments: [...uploadedItems, ...state.attachments],
        }));
      } else {
        set((state) => ({
          uploadQueue: state.uploadQueue.map((q) =>
            q.id === uploadId ? { ...q, status: 'error', error: res.message || 'Upload failed' } : q
          ),
        }));
      }
    } catch (err: any) {
      set((state) => ({
        uploadQueue: state.uploadQueue.map((q) =>
          q.id === uploadId ? { ...q, status: 'error', error: err.message || 'Upload failed' } : q
        ),
      }));
    }
  },

  renameAttachment: async (attachmentId: string, newName: string) => {
    try {
      const res = await AttachmentApiService.updateAttachment(attachmentId, { fileName: newName });
      if (res.success && res.data) {
        const updated = res.data;
        set((state) => ({
          attachments: state.attachments.map((a) => (a.id === attachmentId ? updated : a)),
          previewAttachment:
            state.previewAttachment?.id === attachmentId ? updated : state.previewAttachment,
        }));
      }
    } catch (err: any) {
      console.error('Rename failed:', err);
    }
  },

  replaceAttachment: async (attachmentId: string, file: File) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('action', 'replace');

      const res = await AttachmentApiService.updateAttachment(attachmentId, formData);
      if (res.success && res.data) {
        const updated = res.data;
        set((state) => ({
          attachments: state.attachments.map((a) => (a.id === attachmentId ? updated : a)),
          previewAttachment:
            state.previewAttachment?.id === attachmentId ? updated : state.previewAttachment,
        }));
      }
    } catch (err: any) {
      console.error('Replace failed:', err);
    }
  },

  deleteAttachment: async (attachmentId: string) => {
    try {
      const res = await AttachmentApiService.deleteAttachment(attachmentId);
      if (res.success) {
        set((state) => ({
          attachments: state.attachments.filter((a) => a.id !== attachmentId),
          previewAttachment:
            state.previewAttachment?.id === attachmentId ? null : state.previewAttachment,
        }));
      }
    } catch (err: any) {
      console.error('Delete attachment failed:', err);
    }
  },

  setCategoryFilter: (category) => {
    set((state) => ({ filters: { ...state.filters, category } }));
  },

  setSearchQuery: (search) => {
    set((state) => ({ filters: { ...state.filters, search } }));
  },

  setSortBy: (sortBy) => {
    set((state) => ({ filters: { ...state.filters, sortBy } }));
  },

  setViewMode: (viewMode) => {
    set({ viewMode });
  },

  setPreviewAttachment: (previewAttachment) => {
    set({ previewAttachment });
  },

  clearUploadQueue: () => {
    set({ uploadQueue: [] });
  },
}));
