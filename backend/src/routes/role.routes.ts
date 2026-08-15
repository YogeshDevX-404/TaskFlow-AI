import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { requirePermission } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticateUser);

// GET /api/v1/roles - List system and custom roles
router.get('/', RoleController.getRoles);

// GET /api/v1/roles/:id
router.get('/:id', RoleController.getRoleById);

// POST /api/v1/roles - Create custom role
router.post('/', requirePermission('roles:manage'), RoleController.createRole);

// PUT /api/v1/roles/:id - Update custom role or role permissions
router.put('/:id', requirePermission('roles:manage'), RoleController.updateRole);

// DELETE /api/v1/roles/:id - Delete custom role
router.delete('/:id', requirePermission('roles:manage'), RoleController.deleteRole);

// POST /api/v1/roles/:id/duplicate - Duplicate role
router.post('/:id/duplicate', requirePermission('roles:manage'), RoleController.duplicateRole);

export default router;
