import { Router } from 'express';
import { SearchController } from '../controllers/search.controller';
import { authenticateUser } from '../middlewares/auth.middleware';
import { catchAsync } from '../utils/catchAsync';

const router = Router();

// Protect search endpoints with authentication
router.use(authenticateUser);

router.get('/', catchAsync(SearchController.search));
router.get('/suggestions', catchAsync(SearchController.getSuggestions));
router.get('/recent', catchAsync(SearchController.getRecent));
router.post('/recent', catchAsync(SearchController.saveRecent));
router.delete('/recent', catchAsync(SearchController.clearRecent));

export default router;
