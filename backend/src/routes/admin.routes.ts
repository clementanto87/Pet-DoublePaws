import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import { getAdminAudit, getAdminBookings, getAdminOverview, getAdminPayments, getAdminReports, getAdminSettings, getAdminUsers, getAdminVerification, updateVerification } from '../controllers/admin.controller';

const router = Router();
router.use(authenticateToken, requireAdmin);
router.get('/overview', getAdminOverview);
router.get('/verification', getAdminVerification);
router.patch('/verification/:id', updateVerification);
router.get('/users', getAdminUsers);
router.get('/bookings', getAdminBookings);
router.get('/payments', getAdminPayments);
router.get('/reports', getAdminReports);
router.get('/settings', getAdminSettings);
router.get('/audit', getAdminAudit);

export default router;
