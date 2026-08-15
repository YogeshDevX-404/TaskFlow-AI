import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';

export interface ImageUploadProps {
  value?: string;
  onChange: (value: string) => void;
  label?: string;
  helperText?: string;
  maxSizeMB?: number;
  className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Organization Logo',
  helperText = 'Upload SVG, PNG, JPG or WebP (max 5MB)',
  maxSizeMB = 5,
  className = '',
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const handleFile = (file: File) => {
    setError(null);

    // Validate type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Invalid image format. Supported formats: PNG, JPG, SVG, WebP');
      return;
    }

    // Validate size
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Image size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Convert file to Base64 data URL for instant store/display
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.onerror = () => {
      setError('Failed to read image file');
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = () => {
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      {value ? (
        <div className="relative group rounded-xl border border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-4 transition-all hover:border-indigo-500/50">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center shrink-0">
            <img src={value} alt="Uploaded logo preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
              Logo attached
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Click remove to change or upload a new icon
            </p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-500/10'
              : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500/60 hover:bg-slate-50/50 dark:hover:bg-slate-900/40'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleInputChange}
            accept="image/png, image/jpeg, image/svg+xml, image/webp"
            className="hidden"
          />
          <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            {isDragging ? <Upload className="w-5 h-5 animate-bounce" /> : <ImageIcon className="w-5 h-5" />}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-800 dark:text-slate-200">
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Click to upload logo
              </span>{' '}
              or drag & drop
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
