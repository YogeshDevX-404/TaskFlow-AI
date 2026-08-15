import React, { useEffect, useState } from 'react';
import {
  Building2,
  Mail,
  Shield,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { MemberService } from '../../services/api/memberService';
import { OrganizationInvite } from '../../types/organization';
import { useOrganizationStore } from '../../store/useOrganizationStore';
import { Spinner } from '../ui/Spinner';

export interface AcceptInviteModalProps {
  token: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AcceptInviteModal: React.FC<AcceptInviteModalProps> = ({
  token,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { fetchOrganizations } = useOrganizationStore();
  const [invite, setInvite] = useState<OrganizationInvite | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && token) {
      setIsLoading(true);
      setError(null);
      MemberService.verifyInviteToken(token)
        .then((res) => {
          if (res.data) {
            setInvite(res.data);
          } else {
            setError('Failed to verify invitation token.');
          }
        })
        .catch((err) => {
          setError((err as Error).message || 'Invalid or expired invitation token.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setInvite(null);
      setError(null);
      setSuccess(null);
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleAccept = async () => {
    if (!token) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await MemberService.acceptInvitation(token);
      setSuccess('Invitation accepted! Welcome to the workspace.');
      await fetchOrganizations();
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError((err as Error).message || 'Failed to accept invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!token) return;
    setIsSubmitting(true);
    try {
      await MemberService.rejectInvitation(token);
      onClose();
    } catch (err) {
      setError((err as Error).message || 'Failed to decline invitation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const org = invite && typeof invite.organization === 'object' ? invite.organization : null;
  const invBy = invite && typeof invite.invitedBy === 'object' ? invite.invitedBy : null;
  const inviterName = invBy
    ? `${invBy.firstName || ''} ${invBy.lastName || ''}`.trim() || invBy.email
    : 'An Administrator';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md shadow-2xl p-6 text-center space-y-5">
        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center gap-3">
            <Spinner size="lg" className="text-indigo-600" />
            <p className="text-xs font-semibold text-slate-500">Verifying invitation token...</p>
          </div>
        ) : error ? (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Invitation Issue</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">{error}</p>
            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
            >
              Close Window
            </button>
          </div>
        ) : success ? (
          <div className="space-y-4 py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Accepted!</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">{success}</p>
          </div>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center mx-auto shadow-md">
              <Building2 className="w-7 h-7" />
            </div>

            <div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                Organization Invitation
              </span>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
                Join {org?.name || 'Workspace'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                <strong className="text-slate-700 dark:text-slate-200">{inviterName}</strong> has invited you to join their organization on TaskFlow AI as a <span className="font-bold uppercase text-indigo-500">{invite?.role}</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 text-xs space-y-1 text-left">
              <div className="flex justify-between">
                <span className="text-slate-400">Invited Email:</span>
                <span className="font-mono text-slate-800 dark:text-slate-200">{invite?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Role:</span>
                <span className="font-semibold text-indigo-500 capitalize">{invite?.role}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleReject}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold transition-all cursor-pointer"
              >
                Decline
              </button>

              <button
                onClick={handleAccept}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Spinner size="sm" className="text-white" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Accept Invite</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
