import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { CommentController } from '../controllers/comment.controller';
import { AttachmentController, uploadMultipleMiddleware } from '../controllers/attachment.controller';
import { ActivityController } from '../controllers/activity.controller';
import { HierarchyController } from '../controllers/hierarchy.controller';
import { DependencyController } from '../controllers/dependency.controller';
import { BoardController } from '../controllers/board.controller';
import { GitHubIssueController } from '../controllers/githubIssue.controller';
import { GitHubBranchCommitController } from '../controllers/githubBranchCommit.controller';
import { GitHubPullRequestController } from '../controllers/githubPullRequest.controller';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

router.get('/', catchAsync(TaskController.getTasks));
router.post('/', catchAsync(TaskController.createTask));
router.put('/reorder', catchAsync(BoardController.reorderTasks));
router.put('/:taskId/status', catchAsync(BoardController.updateTaskStatus));

// Task Hierarchy & Tree Endpoints
router.get('/:id/tree', catchAsync(HierarchyController.getTaskTree));
router.post('/:id/subtasks', catchAsync(HierarchyController.createSubtask));
router.put('/:id/subtasks/:subtaskId', catchAsync(HierarchyController.updateSubtask));
router.delete('/:id/subtasks/:subtaskId', catchAsync(HierarchyController.deleteSubtask));
router.post('/:id/convert', catchAsync(HierarchyController.convertTask));

// Task Dependencies Endpoints
router.get('/:id/dependencies', catchAsync(DependencyController.getDependencies));
router.post('/:id/dependencies', catchAsync(DependencyController.addDependency));
router.delete('/:id/dependencies/:dependencyId', catchAsync(DependencyController.removeDependency));

router.get('/:id/details', catchAsync(TaskController.getTaskDetails));
router.get('/:id/activity', catchAsync(ActivityController.getTaskActivity));
router.get('/:id', catchAsync(TaskController.getTaskById));
router.put('/:id', catchAsync(TaskController.updateTask));
router.delete('/:id', catchAsync(TaskController.deleteTask));
router.patch('/:id/archive', catchAsync(TaskController.archiveTask));
router.patch('/:id/restore', catchAsync(TaskController.restoreTask));
router.post('/:id/duplicate', catchAsync(TaskController.duplicateTask));
router.patch('/:id/favorite', catchAsync(TaskController.toggleFavorite));
router.patch('/:id/watch', catchAsync(TaskController.toggleWatch));

// Task Comments Endpoints
router.get('/:id/comments', catchAsync(CommentController.getTaskComments));
router.post('/:id/comments', catchAsync(CommentController.createTaskComment));

// Task Attachments Endpoints
router.get('/:taskId/attachments', catchAsync(AttachmentController.getTaskAttachments));
router.post(
  '/:taskId/attachments',
  uploadMultipleMiddleware,
  catchAsync(AttachmentController.uploadTaskAttachments)
);

// Task GitHub Issue & Commit Integration Endpoints
router.get('/:taskId/github-issue', catchAsync(GitHubIssueController.getTaskIssueMapping));
router.post('/:taskId/github-issue/link', catchAsync(GitHubIssueController.linkIssue));
router.delete('/:taskId/github-issue', catchAsync(GitHubIssueController.unlinkIssue));
router.post('/:taskId/github-issue/create', catchAsync(GitHubIssueController.createIssueFromTask));
router.post('/:taskId/github-issue/sync', catchAsync(GitHubIssueController.syncIssue));
router.get('/:taskId/github-commits', catchAsync(GitHubBranchCommitController.getTaskCommits));

// Task GitHub Pull Request Endpoints
router.get('/:taskId/github-pull-requests', catchAsync(GitHubPullRequestController.getTaskPullRequests));
router.post('/:taskId/github-pull-requests/link', catchAsync(GitHubPullRequestController.linkPullRequest));
router.post('/:taskId/github-pull-requests/create', catchAsync(GitHubPullRequestController.createPullRequest));
router.delete('/:taskId/github-pull-requests/:prId', catchAsync(GitHubPullRequestController.unlinkPullRequest));

export default router;
