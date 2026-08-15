import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { ProjectMemberController } from '../controllers/projectMember.controller';
import { DashboardController } from '../controllers/dashboard.controller';
import { ActivityController } from '../controllers/activity.controller';
import { GitHubIntegrationController } from '../controllers/githubIntegration.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.get('/', catchAsync(ProjectController.getProjects));
router.post('/', catchAsync(ProjectController.createProject));
router.get('/:id/activity', catchAsync(ActivityController.getProjectActivity));
router.get('/:id', catchAsync(ProjectController.getProjectById));
router.put('/:id', catchAsync(ProjectController.updateProject));
router.delete('/:id', catchAsync(ProjectController.deleteProject));
router.patch('/:id/archive', catchAsync(ProjectController.archiveProject));
router.patch('/:id/restore', catchAsync(ProjectController.restoreProject));
router.patch('/:id/favorite', catchAsync(ProjectController.toggleFavorite));
router.patch('/:id/pin', catchAsync(ProjectController.togglePin));
router.post('/:id/duplicate', catchAsync(ProjectController.duplicateProject));

// Dashboard & Analytics Routes
router.get('/:projectId/dashboard', catchAsync(DashboardController.getDashboard));
router.get('/:projectId/analytics', catchAsync(DashboardController.getAnalytics));

// Project Member Routes
router.get('/:projectId/members', catchAsync(ProjectMemberController.getMembers));
router.post('/:projectId/members', catchAsync(ProjectMemberController.addMember));
router.put('/:projectId/members/:memberId', catchAsync(ProjectMemberController.updateMember));
router.delete('/:projectId/members/:memberId', catchAsync(ProjectMemberController.removeMember));

// Project GitHub Repository Connection Routes
router.get('/:projectId/github-repositories', authenticateUser, catchAsync(GitHubIntegrationController.getProjectRepositories));
router.post('/:projectId/github-repositories', authenticateUser, catchAsync(GitHubIntegrationController.connectProjectRepository));
router.post('/:projectId/github-repositories/:connectionId/sync', authenticateUser, catchAsync(GitHubIntegrationController.syncProjectRepository));
router.delete('/:projectId/github-repositories/:connectionId', authenticateUser, catchAsync(GitHubIntegrationController.disconnectProjectRepository));

export default router;
