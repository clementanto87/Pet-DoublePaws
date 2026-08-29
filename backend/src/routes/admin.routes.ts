import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';
import {
    getAdminAudit,
    getAdminBookingDetails,
    getAdminBookings,
    getAdminOverview,
    getAdminPayments,
    getAdminReports,
    getAdminSettings,
    getAdminSitterDetails,
    getAdminUserDetails,
    getAdminUsers,
    getAdminVerification,
    updateAdminBookingStatus,
    updateVerification
} from '../controllers/admin.controller';

const router = Router();
router.use(authenticateToken, requireAdmin);

router.get('/overview', getAdminOverview);

router.get('/verification', getAdminVerification);
router.get('/verification/:id', getAdminSitterDetails);
router.patch('/verification/:id', updateVerification);

router.get('/users', getAdminUsers);
router.get('/users/:id', getAdminUserDetails);

router.get('/bookings', getAdminBookings);
router.get('/bookings/:id', getAdminBookingDetails);
router.patch('/bookings/:id/status', updateAdminBookingStatus);

router.get('/payments', getAdminPayments);
router.get('/reports', getAdminReports);
router.get('/settings', getAdminSettings);
router.get('/audit', getAdminAudit);

export default router;
