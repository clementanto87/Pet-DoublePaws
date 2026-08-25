import { Router } from 'express';
import {
    getPaymentConfig,
    createPaymentIntent,
    getPaymentForBooking,
    getMyPayments,
} from '../controllers/payment.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public: tells the client whether payments are enabled / in sandbox.
router.get('/config', getPaymentConfig);

// NOTE: the Stripe webhook is mounted separately in app.ts because it needs the
// raw request body for signature verification (express.json() would break it).

router.use(authenticateToken);

router.get('/', getMyPayments);
router.get('/bookings/:bookingId', getPaymentForBooking);
router.post('/bookings/:bookingId/intent', createPaymentIntent);

export default router;
