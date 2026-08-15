import { Router } from 'express';
import { GitHubIntegrationController } from '../controllers/githubIntegration.controller';
import { GitHubIssueController } from '../controllers/githubIssue.controller';
import { GitHubBranchCommitController } from '../controllers/githubBranchCommit.controller';
import { GitHubPullRequestController } from '../controllers/githubPullRequest.controller';
import { GitHubWebhookController } from '../controllers/githubWebhook.controller';
import { ActivityAnalyticsController } from '../controllers/activityAnalytics.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// Webhook Delivery & Ingestion Endpoints
// POST /api/v1/integrations/github/webhook (Public endpoint hit by GitHub servers)
router.post('/webhook', GitHubWebhookController.handleWebhook);

// POST /api/v1/integrations/github/webhook/test (Development/Testing simulation endpoint)
router.post('/webhook/test', GitHubWebhookController.handleTestWebhook);

// GET /api/v1/integrations/github/webhooks/deliveries (Webhook audit log)
router.get('/webhooks/deliveries', authenticateUser, GitHubWebhookController.getWebhookDeliveries);

// GET /api/v1/integrations/github/connections/:connectionId/webhook-status
router.get('/connections/:connectionId/webhook-status', authenticateUser, GitHubWebhookController.getConnectionWebhookStatus);

// POST /api/v1/integrations/github/connections/:connectionId/webhook/register
router.post('/connections/:connectionId/webhook/register', authenticateUser, GitHubWebhookController.registerConnectionWebhook);

// DELETE /api/v1/integrations/github/connections/:connectionId/webhook/unregister
router.delete('/connections/:connectionId/webhook/unregister', authenticateUser, GitHubWebhookController.unregisterConnectionWebhook);

// GET /api/v1/integrations/github/connect
router.get('/connect', authenticateUser, GitHubIntegrationController.connect);

// GET /api/v1/integrations/github/callback (Open endpoint called by GitHub OAuth redirect)
router.get('/callback', GitHubIntegrationController.callback);

// GET /api/v1/integrations/github/status
router.get('/status', authenticateUser, GitHubIntegrationController.getStatus);

// GET /api/v1/integrations/github/profile
router.get('/profile', authenticateUser, GitHubIntegrationController.getProfile);

// DELETE /api/v1/integrations/github
router.delete('/', authenticateUser, GitHubIntegrationController.disconnect);

// GET /api/v1/integrations/github/organizations
router.get('/organizations', authenticateUser, GitHubIntegrationController.getOrganizations);

// GET /api/v1/integrations/github/repositories
router.get('/repositories', authenticateUser, GitHubIntegrationController.getRepositories);

// GET /api/v1/integrations/github/repositories/:owner/:repo
router.get('/repositories/:owner/:repo', authenticateUser, GitHubIntegrationController.getRepositoryDetails);

// Repository Sync & Connection Dashboard Endpoints
// GET /api/v1/integrations/github/connections/:connectionId
router.get('/connections/:connectionId', authenticateUser, GitHubIntegrationController.getConnectionDetails);

// POST /api/v1/integrations/github/connections/:connectionId/sync
router.post('/connections/:connectionId/sync', authenticateUser, GitHubIntegrationController.syncConnection);

// GET /api/v1/integrations/github/connections/:connectionId/sync-status
router.get('/connections/:connectionId/sync-status', authenticateUser, GitHubIntegrationController.getSyncStatus);

// GET /api/v1/integrations/github/connections/:connectionId/sync-history
router.get('/connections/:connectionId/sync-history', authenticateUser, GitHubIntegrationController.getSyncHistory);

// Also mount connection routes under /repositories/connections/:connectionId or /repositories/:connectionId
router.get('/repositories/connection/:connectionId', authenticateUser, GitHubIntegrationController.getConnectionDetails);
router.post('/repositories/connection/:connectionId/sync', authenticateUser, GitHubIntegrationController.syncConnection);
router.get('/repositories/connection/:connectionId/sync-status', authenticateUser, GitHubIntegrationController.getSyncStatus);
router.get('/repositories/connection/:connectionId/sync-history', authenticateUser, GitHubIntegrationController.getSyncHistory);

// Project Repository Connection Endpoints
// POST /api/v1/integrations/github/projects/:projectId/repositories
router.post('/projects/:projectId/repositories', authenticateUser, GitHubIntegrationController.connectProjectRepository);

// GET /api/v1/integrations/github/projects/:projectId/repositories
router.get('/projects/:projectId/repositories', authenticateUser, GitHubIntegrationController.getProjectRepositories);

// POST /api/v1/integrations/github/projects/:projectId/repositories/:connectionId/sync
router.post('/projects/:projectId/repositories/:connectionId/sync', authenticateUser, GitHubIntegrationController.syncProjectRepository);

// DELETE /api/v1/integrations/github/projects/:projectId/repositories/:connectionId
router.delete('/projects/:projectId/repositories/:connectionId', authenticateUser, GitHubIntegrationController.disconnectProjectRepository);

// GitHub Issues Integration Endpoints
// GET /api/v1/integrations/github/connections/:connectionId/issues
router.get('/connections/:connectionId/issues', authenticateUser, GitHubIssueController.getIssues);

// GET /api/v1/integrations/github/connections/:connectionId/issues/:issueNumber
router.get('/connections/:connectionId/issues/:issueNumber', authenticateUser, GitHubIssueController.getIssueDetails);

// POST /api/v1/integrations/github/issues/import
router.post('/issues/import', authenticateUser, GitHubIssueController.importIssue);

// POST /api/v1/integrations/github/issues/link
router.post('/issues/link', authenticateUser, GitHubIssueController.linkIssue);

// POST /api/v1/integrations/github/issues/create-from-task
router.post('/issues/create-from-task', authenticateUser, GitHubIssueController.createIssueFromTask);

// DELETE /api/v1/integrations/github/issues/unlink/:taskId
router.delete('/issues/unlink/:taskId', authenticateUser, GitHubIssueController.unlinkIssue);

// POST /api/v1/integrations/github/issues/sync/:taskId
router.post('/issues/sync/:taskId', authenticateUser, GitHubIssueController.syncIssue);

// GitHub Branches & Commits Endpoints
// GET /api/v1/integrations/github/connections/:connectionId/branches
router.get('/connections/:connectionId/branches', authenticateUser, GitHubBranchCommitController.getBranches);

// GET /api/v1/integrations/github/connections/:connectionId/branches/:branchName
router.get('/connections/:connectionId/branches/:branchName', authenticateUser, GitHubBranchCommitController.getBranchDetails);

// GET /api/v1/integrations/github/connections/:connectionId/commits
router.get('/connections/:connectionId/commits', authenticateUser, GitHubBranchCommitController.getCommits);

// GET /api/v1/integrations/github/connections/:connectionId/commits/:sha
router.get('/connections/:connectionId/commits/:sha', authenticateUser, GitHubBranchCommitController.getCommitDetails);

// GET /api/v1/integrations/github/connections/:connectionId/compare
router.get('/connections/:connectionId/compare', authenticateUser, GitHubBranchCommitController.compareCommits);

// GET /api/v1/integrations/github/tasks/:taskId/commits
router.get('/tasks/:taskId/commits', authenticateUser, GitHubBranchCommitController.getTaskCommits);

// GitHub Pull Request Endpoints
// GET /api/v1/integrations/github/connections/:connectionId/pull-requests
router.get('/connections/:connectionId/pull-requests', authenticateUser, GitHubPullRequestController.getPullRequests);

// GET /api/v1/integrations/github/connections/:connectionId/pull-requests/:prNumber
router.get('/connections/:connectionId/pull-requests/:prNumber', authenticateUser, GitHubPullRequestController.getPullRequestDetails);

// GET /api/v1/integrations/github/connections/:connectionId/pull-requests/:prNumber/files
router.get('/connections/:connectionId/pull-requests/:prNumber/files', authenticateUser, GitHubPullRequestController.getPullRequestFiles);

// GET /api/v1/integrations/github/connections/:connectionId/pull-requests/:prNumber/commits
router.get('/connections/:connectionId/pull-requests/:prNumber/commits', authenticateUser, GitHubPullRequestController.getPullRequestCommits);

// GET /api/v1/integrations/github/connections/:connectionId/pull-requests/:prNumber/reviews
router.get('/connections/:connectionId/pull-requests/:prNumber/reviews', authenticateUser, GitHubPullRequestController.getPullRequestReviews);

// POST /api/v1/integrations/github/connections/:connectionId/pull-requests/:prNumber/sync
router.post('/connections/:connectionId/pull-requests/:prNumber/sync', authenticateUser, GitHubPullRequestController.syncPullRequest);

// POST /api/v1/integrations/github/tasks/:taskId/pull-requests/link
router.post('/tasks/:taskId/pull-requests/link', authenticateUser, GitHubPullRequestController.linkPullRequest);

// POST /api/v1/integrations/github/tasks/:taskId/pull-requests/create
router.post('/tasks/:taskId/pull-requests/create', authenticateUser, GitHubPullRequestController.createPullRequest);

// DELETE /api/v1/integrations/github/tasks/:taskId/pull-requests/:prId
router.delete('/tasks/:taskId/pull-requests/:prId', authenticateUser, GitHubPullRequestController.unlinkPullRequest);

// GET /api/v1/integrations/github/tasks/:taskId/pull-requests
router.get('/tasks/:taskId/pull-requests', authenticateUser, GitHubPullRequestController.getTaskPullRequests);

// Developer Activity & Contribution Tracking Analytics
router.get('/developer-activity/overview', authenticateUser, ActivityAnalyticsController.getOverview);
router.get('/developer-activity/developers', authenticateUser, ActivityAnalyticsController.getDevelopers);
router.get('/developer-activity/developers/:userId', authenticateUser, ActivityAnalyticsController.getDeveloperDeepDive);
router.get('/developer-activity/repositories', authenticateUser, ActivityAnalyticsController.getRepositoryAnalytics);
router.get('/developer-activity/export', authenticateUser, ActivityAnalyticsController.exportAnalytics);

export default router;
