import { Router } from 'express';
import { createPlaceholderController } from '../controllers/placeholder.controller';
import { catchAsync } from '../utils/catchAsync';

const router = Router();
const controller = createPlaceholderController('Users');

router.get('/', catchAsync(controller.getAll));
router.get('/:id', catchAsync(controller.getById));
router.put('/:id', catchAsync(controller.update));
router.delete('/:id', catchAsync(controller.delete));

export default router;
