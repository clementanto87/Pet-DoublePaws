import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { deleteMyAccount, exportMyData } from '../controllers/privacy.controller';

const router = Router();
router.use(authenticateToken);
router.get('/export', exportMyData);
router.delete('/account', deleteMyAccount);

export default router;
