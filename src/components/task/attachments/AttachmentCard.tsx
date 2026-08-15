import React, { useState, useRef } from 'react';
import {
  FileText,
  FileImage,
  Video,
  Music,
  Archive,
  File,
  Download,
  Eye,
  Copy,
  Check,
  MoreVertical,
  Edit2,
  RefreshCw,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Attachment, AttachmentViewMode } from '../../../types/attachment';

interface AttachmentCardProps {
  attachment: Attachment;
  viewMode: AttachmentViewMode;
  onPreview: (attachment: Attachment) => void;
  onDownload: (attachment: Attachment) => void;
  onRename: (attachmentId: string, newName: string) => void;
  onReplace: (attachmentId: string, file: File) => void;
  onDelete: (attachmentId: string) => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

export function getFileCategoryIcon(type: string, mimeType: string, fileName: string) {
  const ext = fileName.substring(fileName.lastIndexOf('.')).toLowerCase();
  if (type === 'image' || mimeType.startsWith('image/')) return <FileImage className="w-5 h-5 text-emerald-500" />;
  if (type === 'video' || mimeType.startsWith('video/')) return <Video className="w-5 h-5 text-purple-500" />;
  if (type === 'audio' || mimeType.startsWith('audio/')) return <Music className="w-5 h-5 text-pink-500" />;
  if (type === 'archive' || mimeType.includes('zip') || mimeType.includes('rar')) return <Archive className="w-5 h-5 text-amber-500" />;
  if (mimeType.includes('pdf')) return <FileText className="w-5 h-5 text-rose-500" />;
  if (mimeType.includes('word') || ['.doc', '.docx'].includes(ext)) return <FileText className="w-5 h-5 text-blue-500" />;
  if (mimeType.includes('excel') || ['.xls', '.xlsx', '.csv'].includes(ext)) return <FileText className="w-5 h-5 text-emerald-600" />;
  if (mimeType.includes('powerpoint') || ['.ppt', '.pptx'].includes(ext)) return <FileText className="w-5 h-5 text-orange-500" />;
  return <File className="w-5 h-5 text-slate-500" />;
}

export const AttachmentCard: React.FC<AttachmentCardProps> = ({
  attachment,
  viewMode,
  onPreview,
  onDownload,
  onRename,
  onReplace,
  onDelete,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(attachment.fileName);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(attachment.fileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setShowMenu(false);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim() && renameValue !== attachment.fileName) {
      onRename(attachment.id, renameValue.trim());
    }
    setIsRenaming(false);
    setShowMenu(false);
  };

  const handleReplaceFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onReplace(attachment.id, e.target.files[0]);
    }
    setShowMenu(false);
  };

  const uploaderName = typeof attachment.uploadedBy === 'object' ? attachment.uploadedBy.name : 'User';
  const uploaderAvatar = typeof attachment.uploadedBy === 'object' ? attachment.uploadedBy.avatar : undefined;

  // Render Thumbnail or Grid view vs List view
  if (viewMode === 'list') {
    return (
      <div className="group relative flex items-center gap-3 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-800 hover:shadow-xs transition-all text-xs">
        {/* File Icon */}
        <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
          {attachment.fileType === 'image' && attachment.fileUrl ? (
            <img
              src={attachment.fileUrl}
              alt={attachment.fileName}
              className="w-9 h-9 rounded-lg object-cover"
            />
          ) : (
            getFileCategoryIcon(attachment.fileType, attachment.mimeType, attachment.fileName)
          )}
        </div>

        {/* File Details */}
        <div className="flex-1 min-w-0">
          {isRenaming ? (
            <form onSubmit={handleSaveRename} className="flex items-center gap-2">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="px-2 py-0.5 text-xs rounded border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-medium"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <span
                onClick={() => onPreview(attachment)}
                className="font-medium text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
              >
                {attachment.fileName}
              </span>
              {attachment.version > 1 && (
                <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded">
                  v{attachment.version}
                </span>
              )}
            </div>
          )}
          <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            <span>{formatFileSize(attachment.fileSize)}</span>
            <span>•</span>
            <span>Uploaded by {uploaderName}</span>
            <span>•</span>
            <span>{new Date(attachment.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPreview(attachment)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Preview"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onDownload(attachment)}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            title="Download"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <MoreVertical className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-8 z-30 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 text-xs">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Link Copied' : 'Copy File Link'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsRenaming(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Rename</span>
                </button>

                <button
                  type="button"
                  onClick={() => replaceInputRef.current?.click()}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>Replace File</span>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  type="button"
                  onClick={() => {
                    onDelete(attachment.id);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <input
          type="file"
          ref={replaceInputRef}
          onChange={handleReplaceFileChange}
          className="hidden"
        />
      </div>
    );
  }

  // Thumbnail or Grid Card View
  const isThumbnailView = viewMode === 'thumbnail';

  return (
    <div className="group relative rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden hover:border-blue-400 dark:hover:border-blue-700 hover:shadow-md transition-all flex flex-col">
      {/* Media Preview Box */}
      <div
        onClick={() => onPreview(attachment)}
        className={`relative bg-slate-100 dark:bg-slate-800/80 cursor-pointer overflow-hidden flex items-center justify-center ${
          isThumbnailView ? 'h-36' : 'h-24'
        }`}
      >
        {attachment.fileType === 'image' && attachment.fileUrl ? (
          <img
            src={attachment.fileUrl}
            alt={attachment.fileName}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5 text-slate-400 p-2">
            {getFileCategoryIcon(attachment.fileType, attachment.mimeType, attachment.fileName)}
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {attachment.originalName.substring(attachment.originalName.lastIndexOf('.') + 1) || attachment.fileType}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(attachment);
            }}
            className="p-2 rounded-full bg-white/90 text-slate-900 hover:bg-white shadow-lg transition-transform hover:scale-110"
            title="Preview"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDownload(attachment);
            }}
            className="p-2 rounded-full bg-white/90 text-slate-900 hover:bg-white shadow-lg transition-transform hover:scale-110"
            title="Download"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Version Badge */}
        {attachment.version > 1 && (
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-900/80 text-white backdrop-blur-xs">
            v{attachment.version}
          </div>
        )}
      </div>

      {/* Card Info Content */}
      <div className="p-2.5 flex-1 flex flex-col justify-between text-xs">
        <div>
          {isRenaming ? (
            <form onSubmit={handleSaveRename} className="flex items-center gap-1">
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                className="w-full px-1.5 py-0.5 text-xs rounded border border-blue-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                autoFocus
              />
              <button
                type="submit"
                className="px-2 py-0.5 bg-blue-600 text-white rounded text-[10px] font-medium"
              >
                Save
              </button>
            </form>
          ) : (
            <div className="flex items-start justify-between gap-1">
              <h4
                onClick={() => onPreview(attachment)}
                className="font-medium text-slate-800 dark:text-slate-200 line-clamp-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                title={attachment.fileName}
              >
                {attachment.fileName}
              </h4>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded"
                >
                  <MoreVertical className="w-3.5 h-3.5" />
                </button>

                {showMenu && (
                  <div className="absolute right-0 top-6 z-30 w-44 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl py-1 text-xs">
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Link Copied' : 'Copy File Link'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsRenaming(true);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rename</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => replaceInputRef.current?.click()}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Replace File</span>
                    </button>

                    <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                    <button
                      type="button"
                      onClick={() => {
                        onDelete(attachment.id);
                        setShowMenu(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-1.5 text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
          <span>{formatFileSize(attachment.fileSize)}</span>
          <span className="truncate max-w-[90px]">{uploaderName}</span>
        </div>
      </div>

      <input
        type="file"
        ref={replaceInputRef}
        onChange={handleReplaceFileChange}
        className="hidden"
      />
    </div>
  );
};
