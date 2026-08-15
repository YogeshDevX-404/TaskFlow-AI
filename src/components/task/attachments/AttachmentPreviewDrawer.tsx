import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  RefreshCw,
  Download,
  ExternalLink,
  FileText,
  File,
  Archive,
  Music,
  User,
  Calendar,
  HardDrive,
} from 'lucide-react';
import { Attachment } from '../../../types/attachment';
import { formatFileSize, getFileCategoryIcon } from './AttachmentCard';

interface AttachmentPreviewDrawerProps {
  attachment: Attachment | null;
  onClose: () => void;
  onDownload: (attachment: Attachment) => void;
}

export const AttachmentPreviewDrawer: React.FC<AttachmentPreviewDrawerProps> = ({
  attachment,
  onClose,
  onDownload,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  if (!attachment) return null;

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation((prev) => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const uploaderName =
    typeof attachment.uploadedBy === 'object' ? attachment.uploadedBy.name : 'User';

  const isImage = attachment.fileType === 'image' || attachment.mimeType.startsWith('image/');
  const isVideo = attachment.fileType === 'video' || attachment.mimeType.startsWith('video/');
  const isAudio = attachment.fileType === 'audio' || attachment.mimeType.startsWith('audio/');
  const isPdf = attachment.mimeType.includes('pdf');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800">
        {/* Header Toolbar */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/90 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0">
              {getFileCategoryIcon(attachment.fileType, attachment.mimeType, attachment.fileName)}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">
                {attachment.fileName}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {formatFileSize(attachment.fileSize)} • v{attachment.version}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Image Controls */}
            {isImage && (
              <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleZoomOut}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRotate}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  title="Rotate"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                  title="Reset Zoom & Rotation"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => onDownload(attachment)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Preview Viewport Container */}
        <div className="flex-1 overflow-auto bg-slate-950/90 flex items-center justify-center p-6 relative">
          {/* Image Preview */}
          {isImage && (
            <div className="w-full h-full flex items-center justify-center overflow-auto p-4">
              <img
                src={attachment.fileUrl}
                alt={attachment.fileName}
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transition: 'transform 0.2s ease-out',
                }}
                className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}

          {/* PDF Viewer */}
          {isPdf && (
            <iframe
              src={attachment.fileUrl}
              title={attachment.fileName}
              className="w-full h-full rounded-lg border-0 bg-white"
            />
          )}

          {/* Video Player */}
          {isVideo && (
            <div className="w-full max-w-4xl max-h-full flex items-center justify-center">
              <video
                src={attachment.fileUrl}
                controls
                autoPlay
                className="max-w-full max-h-[70vh] rounded-xl shadow-2xl"
              >
                Your browser does not support video playback.
              </video>
            </div>
          )}

          {/* Audio Player */}
          {isAudio && (
            <div className="w-full max-w-md p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-pink-100 dark:bg-pink-950/60 flex items-center justify-center text-pink-500">
                <Music className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm truncate">
                  {attachment.fileName}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">Audio Attachment</p>
              </div>
              <audio src={attachment.fileUrl} controls className="w-full" />
            </div>
          )}

          {/* Fallback / Office / Document / Archive Card */}
          {!isImage && !isVideo && !isAudio && !isPdf && (
            <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-center space-y-5">
              <div className="w-20 h-20 mx-auto rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400">
                {getFileCategoryIcon(
                  attachment.fileType,
                  attachment.mimeType,
                  attachment.fileName
                )}
              </div>

              <div>
                <h4 className="font-semibold text-base text-slate-800 dark:text-slate-100">
                  {attachment.fileName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Preview not available for this file type. You can download the file to view it.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <HardDrive className="w-3.5 h-3.5 text-slate-400" />
                  <span>Size: {formatFileSize(attachment.fileSize)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{uploaderName}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 col-span-2">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Uploaded {new Date(attachment.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDownload(attachment)}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download File</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
