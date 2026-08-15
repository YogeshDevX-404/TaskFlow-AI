import { Router } from 'express';
import { WorkspaceController } from '../controllers/workspace.controller';
import { ActivityController } from '../controllers/activity.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

// All workspace routes require authentication
router.use(authenticateUser);

router.get('/:id/activity', ActivityController.getWorkspaceActivity);

/**
 * @route   GET /api/v1/workspaces
 * @desc    Get all workspaces for active organization
 */
router.get('/', WorkspaceController.getWorkspaces);

/**
 * @route   POST /api/v1/workspaces
 * @desc    Create a new workspace
 */
router.post('/', WorkspaceController.createWorkspace);

/**
 * @route   GET /api/v1/workspaces/:id
 * @desc    Get workspace by ID or slug
 */
router.get('/:id', WorkspaceController.getWorkspaceById);

/**
 * @route   PUT /api/v1/workspaces/:id
 * @desc    Update workspace details
 */
router.put('/:id', WorkspaceController.updateWorkspace);

/**
 * @route   DELETE /api/v1/workspaces/:id
 * @desc    Delete workspace
 */
router.delete('/:id', WorkspaceController.deleteWorkspace);

/**
 * @route   PATCH /api/v1/workspaces/:id/archive
 * @desc    Archive workspace
 */
router.patch('/:id/archive', WorkspaceController.archiveWorkspace);

/**
 * @route   PATCH /api/v1/workspaces/:id/restore
 * @desc    Restore archived workspace
 */
router.patch('/:id/restore', WorkspaceController.restoreWorkspace);

/**
 * @route   PATCH /api/v1/workspaces/:id/favorite
 * @desc    Toggle workspace favorite status for user
 */
router.patch('/:id/favorite', WorkspaceController.toggleFavorite);

/**
 * @route   PATCH /api/v1/workspaces/:id/pin
 * @desc    Toggle workspace pin status for user
 */
router.patch('/:id/pin', WorkspaceController.togglePin);

/**
 * @route   POST /api/v1/workspaces/:id/duplicate
 * @desc    Duplicate workspace
 */
router.post('/:id/duplicate', WorkspaceController.duplicateWorkspace);

export default router;
