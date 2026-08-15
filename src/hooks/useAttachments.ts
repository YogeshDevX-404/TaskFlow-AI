import { useEffect, useCallback } from 'react';
import { useAttachmentStore } from '../store/useAttachmentStore';
import { AttachmentApiService } from '../services/api/attachmentService';
import { Attachment } from '../types/attachment';

/**
 * Custom hook to manage attachments for a specific task
 */
export function useAttachments(taskId?: string) {
  const {
    attachments,
    loading,
    error,
    filters,
    viewMode,
    previewAttachment,
    uploadQueue,
    fetchAttachments,
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
    clearUploadQueue,
  } = useAttachmentStore();

  useEffect(() => {
    if (taskId) {
      fetchAttachments(taskId);
    }
  }, [taskId, fetchAttachments]);

  return {
    attachments,
    loading,
    error,
    filters,
    viewMode,
    previewAttachment,
    uploadQueue,
    refetch: () => taskId && fetchAttachments(taskId),
    uploadFiles: (files: File[]) => taskId && uploadFiles(taskId, files),
    cancelUpload,
    retryUpload: (uploadId: string) => taskId && retryUpload(taskId, uploadId),
    renameAttachment,
    replaceAttachment,
    deleteAttachment,
    setCategoryFilter,
    setSearchQuery,
    setSortBy,
    setViewMode,
    setPreviewAttachment,
    clearUploadQueue,
  };
}

/**
 * Custom hook specifically for uploading attachments
 */
export function useUploadAttachment(taskId?: string) {
  const { uploadFiles, uploadQueue, cancelUpload, retryUpload, clearUploadQueue } =
    useAttachmentStore();

  const upload = useCallback(
    async (files: File[]) => {
      if (taskId) {
        await uploadFiles(taskId, files);
      }
    },
    [taskId, uploadFiles]
  );

  return {
    upload,
    uploadQueue,
    cancelUpload,
    retryUpload: (uploadId: string) => taskId && retryUpload(taskId, uploadId),
    clearUploadQueue,
  };
}

/**
 * Custom hook specifically for deleting attachments
 */
export function useDeleteAttachment() {
  const { deleteAttachment } = useAttachmentStore();

  const remove = useCallback(
    async (attachmentId: string) => {
      await deleteAttachment(attachmentId);
    },
    [deleteAttachment]
  );

  return {
    deleteAttachment: remove,
  };
}

/**
 * Custom hook specifically for downloading attachments
 */
export function useDownloadAttachment() {
  const download = useCallback(async (attachment: Attachment) => {
    try {
      if (attachment.fileUrl.startsWith('data:')) {
        // Direct data url download
        const a = document.createElement('a');
        a.href = attachment.fileUrl;
        a.download = attachment.fileName || attachment.originalName || 'file';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        return;
      }

      const res = await AttachmentApiService.getDownloadUrl(attachment.id);
      const url = res.data?.fileUrl || attachment.fileUrl;

      // Trigger browser download via anchor
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.download = attachment.fileName || attachment.originalName || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to download file:', err);
      // Fallback
      window.open(attachment.fileUrl, '_blank');
    }
  }, []);

  return {
    downloadAttachment: download,
  };
}
