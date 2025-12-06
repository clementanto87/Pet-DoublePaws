import { Router } from 'express';
import { createReview, getSitterReviews } from '../controllers/review.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public route to view reviews
router.get('/sitter/:sitterId', getSitterReviews);

// Protected route to create review
router.post('/', authenticateToken, createReview);

export default router;
