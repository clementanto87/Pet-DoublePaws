import { Router } from 'express';
import { createBooking, getBookings, getBookingsBySitterId, updateBookingStatus } from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// Public route to get bookings by sitter ID (for calendar display)
router.get('/sitter/:sitterId', getBookingsBySitterId);

// Protected routes
router.use(authenticateToken);

router.post('/', createBooking);
router.get('/', getBookings);
router.patch('/:id/status', updateBookingStatus);

export default router;
