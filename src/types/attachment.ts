export type AttachmentCategory = 'image' | 'document' | 'video' | 'audio' | 'archive' | 'other';

export type AttachmentViewMode = 'grid' | 'list' | 'thumbnail';

export type AttachmentSortBy = 'newest' | 'oldest' | 'largest' | 'smallest' | 'alphabetical';

export interface AttachmentUploader {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
}

export interface Attachment {
  id: string;
  task: string;
  project: string;
  workspace: string;
  organization: string;
  uploadedBy: AttachmentUploader;
  fileName: string;
  originalName: string;
  fileUrl: string;
  publicId: string;
  fileType: AttachmentCategory;
  mimeType: string;
  fileSize: number; // in bytes
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttachmentFilterOptions {
  category?: AttachmentCategory | 'all';
  search?: string;
  sortBy?: AttachmentSortBy;
}

export interface UploadQueueItem {
  id: string;
  file: File;
  fileName: string;
  fileSize: number;
  fileType: AttachmentCategory;
  progress: number; // 0 to 100
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'cancelled';
  error?: string;
}
