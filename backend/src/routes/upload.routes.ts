import express from 'express';
import { uploadImage, uploadMultipleImages, uploadMiddleware, uploadMultipleMiddleware } from '../controllers/upload.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = express.Router();

router.post('/', authenticateToken, uploadMiddleware, uploadImage);
router.post('/multiple', authenticateToken, uploadMultipleMiddleware, uploadMultipleImages);

export default router;
