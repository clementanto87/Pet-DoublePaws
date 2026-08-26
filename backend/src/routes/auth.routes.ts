import { Router } from 'express';
import { authenticateToken as auth } from '../middleware/auth.middleware';
import { signup, login, googleLogin, facebookLogin, appleLogin, getProfile } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/facebook', facebookLogin);
router.post('/apple', appleLogin);
router.get('/me', auth, getProfile);

export default router;
