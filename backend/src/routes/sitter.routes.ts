import { Router } from 'express';
import { createOrUpdateSitterProfile, getSitterProfile, searchSitters } from '../controllers/sitter.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public routes
router.get('/search', searchSitters);

// Protected routes
router.use(authenticateToken);
router.post('/', createOrUpdateSitterProfile);
router.get('/me', getSitterProfile);

export default router;
