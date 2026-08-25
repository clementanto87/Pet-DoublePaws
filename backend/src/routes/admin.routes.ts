import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { getAdminOverview, getAdminBookings } from '../controllers/admin.controller';

const router = Router();

// Temporary authenticated access for the admin preview. Add an admin-role
// middleware before production launch.
router.use(authenticateToken);
router.get('/overview', getAdminOverview);
router.get('/bookings', getAdminBookings);

export default router;
