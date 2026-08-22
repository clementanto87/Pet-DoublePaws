import { Router } from 'express';
import { createOrUpdateSitterProfile, getSitterProfile, getSitterById, searchSitters } from '../controllers/sitter.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.post('/search', searchSitters);

// `/me` (literal, protected) must be registered BEFORE the `/:id` param route
// so a request to `/me` is not captured by `/:id`.
router.get('/me', authenticateToken, getSitterProfile);

// Public: single sitter by id (deep links / page refresh)
router.get('/:id', getSitterById);

// Protected routes
router.use(authenticateToken);
router.post('/', createOrUpdateSitterProfile);

export default router;
