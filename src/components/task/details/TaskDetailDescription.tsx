import React, { useState } from 'react';
import {
  FileText,
  Edit3,
  Check,
  X,
  Bold,
  Italic,
  Heading,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Link2,
  Image as ImageIcon,
  Sparkles,
} from 'lucide-react';

export interface TaskDetailDescriptionProps {
  description: string;
  onSaveDescription: (newDesc: string) => Promise<void>;
}

export const TaskDetailDescription: React.FC<TaskDetailDescriptionProps> = ({
  description,
  onSaveDescription,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(description || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSaveDescription(value);
      setIsEditing(false);
    } catch {
      // Handled in parent
    } finally {
      setSaving(false);
    }
  };

  const handleInsert = (syntax: string) => {
    setValue((prev) => prev + '\n' + syntax);
  };

  // Helper to render basic markdown formatting nicely in preview mode
  const renderMarkdownPreview = (text: string) => {
    if (!text || !text.trim()) {
      return (
        <p className="text-slate-400 dark:text-slate-500 italic text-xs py-2">
          No description provided for this task. Click edit to add rich details, checklists, code blocks, or acceptance criteria.
        </p>
      );
    }

    const lines = text.split('\n');
    return (
      <div className="space-y-3 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
        {lines.map((line, idx) => {
          const trimmed = line.trim();

          // Heading 1
          if (trimmed.startsWith('# ')) {
            return (
              <h1 key={idx} className="text-lg font-extrabold text-slate-900 dark:text-white pt-2 border-b border-slate-100 dark:border-slate-800 pb-1">
                {trimmed.replace('# ', '')}
              </h1>
            );
          }
          // Heading 2
          if (trimmed.startsWith('## ')) {
            return (
              <h2 key={idx} className="text-base font-bold text-slate-900 dark:text-white pt-2">
                {trimmed.replace('## ', '')}
              </h2>
            );
          }
          // Heading 3
          if (trimmed.startsWith('### ')) {
            return (
              <h3 key={idx} className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider pt-1">
                {trimmed.replace('### ', '')}
              </h3>
            );
          }
          // Checklist item
          if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('[ ] ')) {
            const label = trimmed.replace(/- \[\s*\]\s*/, '').replace(/\[\s*\]\s*/, '');
            return (
              <div key={idx} className="flex items-center gap-2 pl-1 py-0.5">
                <input type="checkbox" disabled className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-0" />
                <span className="text-slate-700 dark:text-slate-300">{label}</span>
              </div>
            );
          }
          if (trimmed.startsWith('- [x] ') || trimmed.startsWith('[x] ')) {
            const label = trimmed.replace(/- \[x\]\s*/, '').replace(/\[x\]\s*/, '');
            return (
              <div key={idx} className="flex items-center gap-2 pl-1 py-0.5">
                <input type="checkbox" checked disabled className="w-3.5 h-3.5 rounded border-slate-300 text-indigo-600 focus:ring-0" />
                <span className="line-through text-slate-400 dark:text-slate-500">{label}</span>
              </div>
            );
          }
          // Bullet item
          if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
                <span>{trimmed.substring(2)}</span>
              </div>
            );
          }
          // Blockquote
          if (trimmed.startsWith('> ')) {
            return (
              <blockquote key={idx} className="pl-3 py-1.5 my-1 border-l-2 border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 text-slate-600 dark:text-slate-400 italic rounded-r-lg">
                {trimmed.replace('> ', '')}
              </blockquote>
            );
          }
          // Code block / snippet
          if (trimmed.startsWith('```')) {
            return null; // Handled conceptually in code blocks
          }
          if (trimmed.startsWith('`') && trimmed.endsWith('`') && trimmed.length > 2) {
            return (
              <code key={idx} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono text-xs text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700 inline-block">
                {trimmed.replace(/`/g, '')}
              </code>
            );
          }

          // Empty line
          if (!trimmed) {
            return <div key={idx} className="h-1" />;
          }

          // Standard paragraph
          return <p key={idx}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Header Bar for Description */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Description
          </h3>
        </div>

        {!isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition flex items-center gap-1.5 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Edit</span>
          </button>
        )}
      </div>

      {/* Editor or Preview Mode */}
      {isEditing ? (
        <div className="space-y-2 border border-indigo-500/30 rounded-2xl p-3 bg-white dark:bg-slate-900/80 shadow-sm">
          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 flex-wrap pb-2 border-b border-slate-200 dark:border-slate-800 text-slate-500">
            <button
              type="button"
              onClick={() => handleInsert('## Heading')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold"
              title="Heading"
            >
              <Heading className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert('- Bullet item')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Bullet List"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert('- [ ] Task checklist item')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Checklist"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert('```js\n// Code block placeholder\nconsole.log("Hello TaskFlow");\n```')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Code Block"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert('> Blockquote highlight')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Quote"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert('[Link Title](https://example.com)')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Link"
            >
              <Link2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleInsert('![Image Placeholder](https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe)')}
              className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Image Placeholder"
            >
              <ImageIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <textarea
            rows={8}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Write task description using Markdown, bullet points, checklists, or code blocks..."
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
          />

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={handleSave}
              className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-indigo-600/20"
            >
              {saving ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5" />
              )}
              <span>Save Description</span>
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => setIsEditing(true)}
          className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-500/40 transition cursor-pointer group"
        >
          {renderMarkdownPreview(description)}
        </div>
      )}
    </div>
  );
};
