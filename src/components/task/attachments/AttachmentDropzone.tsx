import React, { useEffect, useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Clipboard, File, AlertCircle, CheckCircle2 } from 'lucide-react';

interface AttachmentDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  isUploading?: boolean;
}

export const AttachmentDropzone: React.FC<AttachmentDropzoneProps> = ({
  onFilesSelected,
  isUploading,
}) => {
  const [dragError, setDragError] = useState<string | null>(null);
  const [pasteSuccess, setPasteSuccess] = useState<boolean>(false);

  const validateAndPassFiles = useCallback(
    (files: File[]) => {
      setDragError(null);
      const validFiles: File[] = [];

      for (const file of files) {
        if (file.size > 100 * 1024 * 1024) {
          setDragError(`"${file.name}" exceeds the 100 MB size limit.`);
          continue;
        }

        const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
        if (
          [
            '.exe',
            '.sh',
            '.bat',
            '.cmd',
            '.dll',
            '.msi',
            '.vbs',
            '.scr',
            '.php',
            '.js',
            '.py',
          ].includes(ext)
        ) {
          setDragError(`File "${file.name}" has an unsafe extension and was rejected.`);
          continue;
        }

        validFiles.push(file);
      }

      if (validFiles.length > 0) {
        onFilesSelected(validFiles);
      }
    },
    [onFilesSelected]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: any[]) => {
      if (fileRejections.length > 0) {
        const firstErr = fileRejections[0].errors[0]?.message || 'File upload rejected';
        setDragError(firstErr);
      }
      validateAndPassFiles(acceptedFiles);
    },
    [validateAndPassFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxSize: 100 * 1024 * 1024, // 100MB
    multiple: true,
  } as any);

  // Handle Clipboard Paste (e.g. pasting screenshots directly)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (!e.clipboardData) return;
      const items = e.clipboardData.items;
      const files: File[] = [];

      for (let i = 0; i < items.length; i++) {
        if (items[i].kind === 'file') {
          const file = items[i].getAsFile();
          if (file) {
            // Give pasted image a clean filename if needed
            const fileName = file.name || `Pasted_Image_${Date.now()}.png`;
            const renamedFile = new File([file], fileName, { type: file.type });
            files.push(renamedFile);
          }
        }
      }

      if (files.length > 0) {
        validateAndPassFiles(files);
        setPasteSuccess(true);
        setTimeout(() => setPasteSuccess(false), 3000);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [validateAndPassFiles]);

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
          isDragActive
            ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm">
            <Upload className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              {isDragActive ? (
                <span className="text-blue-600 dark:text-blue-400">Drop files here to upload</span>
              ) : (
                <>
                  <span className="text-blue-600 dark:text-blue-400 underline underline-offset-2">
                    Click to browse
                  </span>{' '}
                  or drag & drop files here
                </>
              )}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-center gap-1.5">
              <span>Supports Images, Documents, Videos, Audio & Archives (Max 100MB)</span>
            </p>
          </div>
          <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-200/60 dark:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-medium">
            <Clipboard className="w-3 h-3 text-slate-500" />
            <span>Tip: You can paste screenshots directly with <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs font-mono">Ctrl+V</kbd> / <kbd className="px-1 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 shadow-2xs font-mono">⌘V</kbd></span>
          </div>
        </div>
      </div>

      {dragError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs border border-red-200 dark:border-red-900/50">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span className="flex-1">{dragError}</span>
        </div>
      )}

      {pasteSuccess && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs border border-emerald-200 dark:border-emerald-900/50">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Image pasted from clipboard successfully! Uploading...</span>
        </div>
      )}
    </div>
  );
};
