import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

import authRoutes from './routes/auth.routes';
import petRoutes from './routes/pet.routes';
import sitterRoutes from './routes/sitter.routes';
import bookingRoutes from './routes/booking.routes';
import reviewRoutes from './routes/review.routes';
import messageRoutes from './routes/message.routes';
import adminRoutes from './routes/admin.routes';
import supportRoutes from './routes/support.routes';
import paymentRoutes from './routes/payment.routes';
import { handleStripeWebhook } from './controllers/payment.controller';

// Middleware
import { isAllowedOrigin } from './config/cors';

app.use(cors({
  origin: (origin, callback) => {
    // Allow non-browser clients (curl, mobile apps, server-to-server) with no Origin header
    if (!origin || isAllowedOrigin(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));

// Stripe webhook MUST be registered before express.json(): signature
// verification needs the untouched raw body, and a JSON parser would consume it.
app.post(
  '/api/payments/webhook',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/pets', petRoutes);
app.use('/api/sitters', sitterRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support-requests', supportRoutes);
app.use('/api/payments', paymentRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Pet Day Care API' });
});



export default app;
