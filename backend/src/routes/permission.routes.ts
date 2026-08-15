import { Router } from 'express';
import { RoleController } from '../controllers/role.controller';
import { authenticateUser } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticateUser);

router.get('/', RoleController.getPermissions);

export default router;
