import React, { useState } from 'react';
import { ProjectMemberRole, ProjectMemberStatus } from '../../../types/projectMember';
import { X, UserPlus, Mail, Shield, AlertCircle, Check } from 'lucide-react';

interface AddProjectMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { email: string; role: ProjectMemberRole; status: ProjectMemberStatus }) => Promise<any>;
  isLoading?: boolean;
  error?: string | null;
  existingEmails?: string[];
}

// Pre-populated organization members available to be added
const ORG_MEMBERS_SUGGESTIONS = [
  { name: 'Michael Scott', email: 'm.scott@acme.com', role: 'Regional Manager', avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150' },
  { name: 'Pam Beesly', email: 'p.beesly@acme.com', role: 'Office Administrator', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150' },
  { name: 'Jim Halpert', email: 'j.halpert@acme.com', role: 'Sales Lead', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150' },
  { name: 'Dwight Schrute', email: 'd.schrute@acme.com', role: 'Assistant Manager', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150' },
  { name: 'Ryan Howard', email: 'r.howard@acme.com', role: 'Fullstack Engineer', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
];

export const AddProjectMemberModal: React.FC<AddProjectMemberModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading = false,
  error = null,
  existingEmails = [],
}) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ProjectMemberRole>('Developer');
  const [status, setStatus] = useState<ProjectMemberStatus>('active');
  const [localError, setLocalError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectSuggested = (suggestedEmail: string) => {
    setEmail(suggestedEmail);
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setLocalError('Please enter or select a valid email address.');
      return;
    }

    if (existingEmails.map((e) => e.toLowerCase()).includes(trimmedEmail)) {
      setLocalError('This user is already a member of this project.');
      return;
    }

    const result = await onSubmit({
      email: trimmedEmail,
      role,
      status,
    });

    if (result) {
      setEmail('');
      setRole('Developer');
      setStatus('active');
      onClose();
    }
  };

  const filteredSuggestions = ORG_MEMBERS_SUGGESTIONS.filter(
    (s) => !existingEmails.map((e) => e.toLowerCase()).includes(s.email.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
              <UserPlus className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Add Member to Project
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select an organization member or enter an email address
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {(localError || error) && (
            <div className="flex items-center gap-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/30 p-3 text-xs text-rose-700 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{localError || error}</span>
            </div>
          )}

          {/* Quick Add from Organization */}
          {filteredSuggestions.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Organization Members Available
              </label>
              <div className="grid grid-cols-1 gap-2 max-h-36 overflow-y-auto pr-1">
                {filteredSuggestions.map((s) => {
                  const isSelected = email.toLowerCase() === s.email.toLowerCase();
                  return (
                    <button
                      key={s.email}
                      type="button"
                      onClick={() => handleSelectSuggested(s.email)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border text-left text-xs transition-all ${
                        isSelected
                          ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={s.avatar}
                          alt={s.name}
                          className="h-7 w-7 rounded-full object-cover shrink-0"
                        />
                        <div className="truncate">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{s.name}</p>
                          <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                            {s.email}
                          </p>
                        </div>
                      </div>
                      {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Email Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Email Address</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setLocalError(null);
              }}
              placeholder="e.g. alex.dev@acme.com"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-900 dark:text-slate-100 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-400"
              required
            />
          </div>

          {/* Role Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-slate-400" />
              <span>Project Role</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  { role: 'Project Owner', desc: 'Full project control' },
                  { role: 'Project Admin', desc: 'Manage settings & members' },
                  { role: 'Developer', desc: 'Create & execute tasks' },
                  { role: 'Tester', desc: 'Log & verify issues' },
                  { role: 'Viewer', desc: 'Read-only access' },
                ] as const
              ).map((r) => {
                const active = role === r.role;
                return (
                  <button
                    key={r.role}
                    type="button"
                    onClick={() => setRole(r.role)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      active
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <p className="text-xs font-semibold">{r.role}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {r.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Status Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
              Initial Membership Status
            </label>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="active"
                  checked={status === 'active'}
                  onChange={() => setStatus('active')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Active Member</span>
              </label>
              <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="radio"
                  name="status"
                  value="pending"
                  checked={status === 'pending'}
                  onChange={() => setStatus('pending')}
                  className="text-indigo-600 focus:ring-indigo-500"
                />
                <span>Pending Invitation</span>
              </label>
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-medium text-white shadow-sm transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Adding...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Add Member</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
