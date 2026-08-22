import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { createSupportRequest, getMySupportRequests, updateSupportRequest } from '../controllers/support.controller';

const router = Router();
router.use(authenticateToken);
router.post('/', createSupportRequest);
router.get('/mine', getMySupportRequests);
// Temporary authenticated access for the admin preview. Add an admin-role
// middleware before production launch.
router.patch('/:id', updateSupportRequest);

export default router;
