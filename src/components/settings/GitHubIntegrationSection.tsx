import React, { useState, useEffect, useCallback } from 'react';
import {
  GitBranch,
  Github,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  LogOut,
  Clock,
  KeyRound,
} from 'lucide-react';
import {
  GitHubIntegrationApiService,
  IGitHubConnectionData,
  IGitHubProfileData,
} from '../../services/api/githubIntegrationService';
import { Spinner } from '../ui/Spinner';

export const GitHubIntegrationSection: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [disconnecting, setDisconnecting] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [connected, setConnected] = useState<boolean>(false);
  const [connection, setConnection] = useState<IGitHubConnectionData | null>(null);
  const [profile, setProfile] = useState<IGitHubProfileData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showConfirmDisconnect, setShowConfirmDisconnect] = useState<boolean>(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const statusRes = await GitHubIntegrationApiService.getStatus();
      setConnected(statusRes.connected);
      setConnection(statusRes.connection);

      if (statusRes.connected && statusRes.connection) {
        // Fetch detailed profile
        try {
          const profileData = await GitHubIntegrationApiService.getProfile();
          setProfile(profileData);
        } catch {
          // Fallback to connection model metadata
        }
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to load GitHub connection status');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();

    // Listen for OAuth completion messages from popup window
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'GITHUB_OAUTH_SUCCESS') {
        setConnecting(false);
        setSuccessMsg(`Successfully connected to GitHub as @${event.data.githubUsername || 'user'}`);
        fetchStatus();
      } else if (event.data && event.data.type === 'GITHUB_OAUTH_ERROR') {
        setConnecting(false);
        setError(event.data.error || 'GitHub authorization failed or was denied.');
      }
    };

    window.addEventListener('message', handleMessage);

    // Also check query param if redirect happened back to same tab
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('github') === 'success') {
      setSuccessMsg('GitHub account successfully connected!');
      // Clean query string
      window.history.replaceState({}, document.title, window.location.pathname);
      fetchStatus();
    } else if (urlParams.get('github') === 'denied' || urlParams.get('github') === 'error') {
      setError('GitHub connection attempt was cancelled or failed.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [fetchStatus]);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { url } = await GitHubIntegrationApiService.getConnectUrl();

      // Open OAuth in popup window for smooth UX
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.innerWidth - width) / 2;
      const top = window.screenY + (window.innerHeight - height) / 2;

      const popup = window.open(
        url,
        'GitHubOAuthPopup',
        `width=${width},height=${height},left=${left},top=${top},status=no,resizable=yes,scrollbars=yes`
      );

      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        // Fallback: full page redirect if popups are blocked
        window.location.href = url;
      } else {
        // Poll popup closure as fallback
        const timer = setInterval(() => {
          if (popup.closed) {
            clearInterval(timer);
            setConnecting(false);
            fetchStatus();
          }
        }, 1000);
      }
    } catch (err: any) {
      setConnecting(false);
      setError(err?.response?.data?.message || err.message || 'Failed to initiate GitHub OAuth connection.');
    }
  };

  const handleDisconnect = async () => {
    setDisconnecting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      await GitHubIntegrationApiService.disconnect();
      setConnected(false);
      setConnection(null);
      setProfile(null);
      setShowConfirmDisconnect(false);
      setSuccessMsg('GitHub account has been disconnected.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to disconnect GitHub account.');
    } finally {
      setDisconnecting(false);
    }
  };

  const handleRefreshProfile = async () => {
    setRefreshing(true);
    setError(null);
    try {
      const profileData = await GitHubIntegrationApiService.getProfile();
      setProfile(profileData);
      await fetchStatus();
      setSuccessMsg('GitHub connection and profile refreshed.');
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to refresh GitHub profile.');
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-center gap-3">
        <Spinner size="md" />
        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
          Loading GitHub integration status...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 flex items-center justify-center shadow-md">
            <Github className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              GitHub Integration
              {connected ? (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Connected
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 inline-flex items-center gap-1">
                  <XCircle className="w-3 h-3" /> Not Connected
                </span>
              )}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect your GitHub account to enable organization repository linkage and developer activity tracking.
            </p>
          </div>
        </div>

        {connected && (
          <button
            onClick={handleRefreshProfile}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Sync Status</span>
          </button>
        )}
      </div>

      {/* Error & Success Banners */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Integration Error</p>
            <p className="mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-start gap-3">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Success</p>
            <p className="mt-0.5">{successMsg}</p>
          </div>
        </div>
      )}

      {/* Connected State View */}
      {connected && connection ? (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <img
                src={connection.githubAvatarUrl || profile?.avatar_url || 'https://github.com/identicons/user.png'}
                alt={connection.githubUsername}
                className="w-16 h-16 rounded-2xl border-2 border-indigo-500/30 shadow-md object-cover"
              />
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {connection.githubName || profile?.name || connection.githubUsername}
                  </h3>
                  <a
                    href={connection.githubProfileUrl || `https://github.com/${connection.githubUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                  >
                    @{connection.githubUsername}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                {connection.githubEmail && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {connection.githubEmail}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Connected: {new Date(connection.connectedAt).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                    Last Sync: {new Date(connection.lastSyncedAt).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>

            <div>
              {!showConfirmDisconnect ? (
                <button
                  onClick={() => setShowConfirmDisconnect(true)}
                  className="px-4 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold transition flex items-center gap-2 border border-rose-500/20"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Disconnect GitHub</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
                  >
                    {disconnecting ? <Spinner size="sm" /> : <XCircle className="w-3.5 h-3.5" />}
                    <span>Confirm</span>
                  </button>
                  <button
                    onClick={() => setShowConfirmDisconnect(false)}
                    className="px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Additional Safe GitHub User Details */}
          {profile && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Public Repos</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                  {profile.public_repos ?? 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Followers</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                  {profile.followers ?? 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Following</span>
                <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">
                  {profile.following ?? 0}
                </span>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 text-center">
                <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Scopes</span>
                <span className="text-xs font-mono font-medium text-indigo-600 dark:text-indigo-400 mt-1 block truncate" title={connection.scope}>
                  {connection.scope || 'read:user'}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Disconnected / Empty State */
        <div className="p-8 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40 border border-dashed border-slate-200 dark:border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <GitBranch className="w-8 h-8" />
          </div>

          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Connect your GitHub Account
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Linking your GitHub account establishes a secure OAuth foundation for future organization features including repository linking, issue tracking, and automated commit logs.
            </p>
          </div>

          <button
            onClick={handleConnect}
            disabled={connecting}
            className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-semibold text-xs transition shadow-lg flex items-center justify-center gap-2 mx-auto disabled:opacity-50 cursor-pointer"
          >
            {connecting ? (
              <>
                <Spinner size="sm" />
                <span>Connecting to GitHub...</span>
              </>
            ) : (
              <>
                <Github className="w-4 h-4" />
                <span>Connect GitHub Account</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Token Security Notice */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800 flex items-start gap-3">
        <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
          <p className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
            <KeyRound className="w-3.5 h-3.5" /> Token Security Guarantee
          </p>
          <p>
            Your OAuth access token is encrypted server-side using AES-256-GCM encryption. Access tokens are strictly isolated to server-side workers and are never transmitted to client browsers, error logs, or audit records.
          </p>
        </div>
      </div>
    </div>
  );
};
