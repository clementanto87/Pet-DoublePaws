import { Request, Response } from 'express';
import Stripe from 'stripe';
import { AppDataSource } from '../config/database';
import { Payment, PaymentStatus } from '../entities/Payment.entity';
import { Booking, BookingStatus } from '../entities/Booking.entity';
import { User } from '../entities/User.entity';
import { SitterProfile } from '../entities/SitterProfile.entity';
import { StripeWebhookEvent } from '../entities/StripeWebhookEvent.entity';
import {
    stripe,
    isStripeConfigured,
    stripeCurrency,
    stripeWebhookSecret,
    isStripeTestMode,
    calculateFeeSplit,
    getOrCreateStripeCustomer,
} from '../config/stripe';
import { emailService } from '../services/email.service';

const paymentRepository = () => AppDataSource.getRepository(Payment);
const bookingRepository = () => AppDataSource.getRepository(Booking);
const userRepository = () => AppDataSource.getRepository(User);
const sitterRepository = () => AppDataSource.getRepository(SitterProfile);
const webhookEventRepository = () => AppDataSource.getRepository(StripeWebhookEvent);

const notifyPaymentStatus = (payment: Payment, status: 'succeeded' | 'failed' | 'refunded') => {
    if (!payment.booking) return;

    if (payment.booking.owner) {
        void emailService.sendPaymentStatus(payment.booking.owner, payment.booking, status);
    }
    if (payment.booking.sitter?.user) {
        void emailService.sendPaymentStatus(payment.booking.sitter.user, payment.booking, status);
    }
};

/** Money is stored/sent to Stripe in the smallest currency unit (cents). */
const toMinorUnits = (amount: number | string): number =>
    Math.round(Number(amount) * 100);

/**
 * GET /api/payments/config
 * Lets the frontend know whether payments are enabled and if we're in sandbox.
 */
export const getPaymentConfig = async (_req: Request, res: Response) => {
    res.json({
        enabled: isStripeConfigured(),
        testMode: isStripeTestMode(),
        currency: stripeCurrency,
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY || null,
    });
};

/**
 * POST /api/payments/bookings/:bookingId/intent
 *
 * Creates (or returns the existing) Stripe PaymentIntent for an accepted booking.
 * Stripe authorizes the funds now and captures them only after the customer
 * confirms the sitter's completion request.
 *
 * Routes net funds directly to the Sitter's Stripe Express account while Double Paws
 * collects the platform commission as an application_fee_amount.
 */
export const createPaymentIntent = async (req: Request, res: Response) => {
    try {
        if (!isStripeConfigured() || !stripe) {
            return res.status(503).json({ message: 'Payments are not configured on this server' });
        }

        const { bookingId } = req.params;
        const userId = (req as any).user.id;

        const booking = await bookingRepository().findOne({
            where: { id: bookingId },
            relations: ['sitter', 'sitter.user', 'owner'],
        });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Only the owner of the booking may pay for it.
        if (booking.ownerId !== userId) {
            return res.status(403).json({ message: 'Not authorized to pay for this booking' });
        }

        if (booking.status !== BookingStatus.ACCEPTED) {
            return res.status(400).json({
                message: 'This booking can only be paid after the sitter accepts it',
            });
        }

        const amount = toMinorUnits(booking.totalPrice);
        if (!Number.isFinite(amount) || amount <= 0) {
            return res.status(400).json({ message: 'Booking has no payable amount' });
        }

        const { platformFeeAmount, sitterAmount } = calculateFeeSplit(amount);

        // Fetch or create Stripe Customer for the owner
        const user = await userRepository().findOne({ where: { id: userId } });
        let customerId: string | null = null;
        if (user) {
            customerId = await getOrCreateStripeCustomer(user);
            if (customerId && user.stripeCustomerId !== customerId) {
                user.stripeCustomerId = customerId;
                await userRepository().save(user);
            }
        }

        // Reuse an existing intent so retrying never double-charges.
        const existing = await paymentRepository().findOne({ where: { bookingId } });

        if (existing?.status === PaymentStatus.SUCCEEDED) {
            return res.status(409).json({ message: 'This booking has already been paid' });
        }

        if (existing) {
            const intent = await stripe.paymentIntents.retrieve(existing.stripePaymentIntentId);
            // Only reuse if it's still usable; otherwise fall through and make a new one.
            if (intent.status !== 'canceled' && intent.status !== 'succeeded') {
                return res.json({
                    clientSecret: intent.client_secret,
                    amount: existing.amount,
                    currency: existing.currency,
                    paymentId: existing.id,
                });
            }
        }

        // Separate Charges and Transfers (Escrow Model):
        // Funds are charged to and held in Double Paws' platform account upon booking acceptance.
        // Net funds are transferred to the sitter only after mutual confirmation of completion.
        const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
            amount,
            currency: stripeCurrency,
            automatic_payment_methods: { enabled: true },
            customer: customerId || undefined,
            transfer_group: `booking_${booking.id}`,
            metadata: {
                bookingId: booking.id,
                ownerId: booking.ownerId,
                sitterId: booking.sitterId,
                platformFeeAmount: String(platformFeeAmount),
                sitterAmount: String(sitterAmount),
            },
        };

        const intent = await stripe.paymentIntents.create(
            paymentIntentParams,
            { idempotencyKey: `pi_create_${booking.id}_${amount}` }
        );

        if (existing) {
            existing.stripePaymentIntentId = intent.id;
            existing.amount = amount;
            existing.platformFeeAmount = platformFeeAmount;
            existing.sitterAmount = sitterAmount;
            existing.currency = stripeCurrency;
            existing.status = PaymentStatus.PENDING;
            existing.failureReason = null;
            await paymentRepository().save(existing);
        } else {
            await paymentRepository().save(
                paymentRepository().create({
                    bookingId: booking.id,
                    ownerId: booking.ownerId,
                    stripePaymentIntentId: intent.id,
                    amount,
                    platformFeeAmount,
                    sitterAmount,
                    currency: stripeCurrency,
                    status: PaymentStatus.PENDING,
                })
            );
        }

        res.json({
            clientSecret: intent.client_secret,
            amount,
            currency: stripeCurrency,
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ message: 'Failed to start payment' });
    }
};

/**
 * GET /api/payments/bookings/:bookingId
 * Payment status for a single booking (used to render Paid / Pay now).
 */
export const getPaymentForBooking = async (req: Request, res: Response) => {
    try {
        const { bookingId } = req.params;
        const userId = (req as any).user.id;

        const payment = await paymentRepository().findOne({
            where: { bookingId },
            relations: ['booking', 'booking.sitter', 'booking.sitter.user'],
        });

        if (!payment) {
            return res.json({ status: null });
        }

        const isBookingSitter = payment.booking?.sitter?.userId === userId;
        if (payment.ownerId !== userId && !isBookingSitter) {
            return res.status(403).json({ message: 'Not authorized' });
        }

        // Real-time synchronization with Stripe if status is still PENDING:
        // Ensures instant UI reactivity without waiting for webhooks, and captures legacy holds.
        if (payment.status === PaymentStatus.PENDING && isStripeConfigured() && stripe && payment.stripePaymentIntentId) {
            try {
                const intent = await stripe.paymentIntents.retrieve(payment.stripePaymentIntentId);
                if (intent.status === 'succeeded') {
                    payment.status = PaymentStatus.SUCCEEDED;
                    payment.failureReason = null;
                    await paymentRepository().save(payment);
                    notifyPaymentStatus(payment, 'succeeded');
                } else if (intent.status === 'requires_capture') {
                    // Capture legacy authorization hold into platform escrow so it doesn't expire
                    await stripe.paymentIntents.capture(payment.stripePaymentIntentId);
                    payment.status = PaymentStatus.SUCCEEDED;
                    payment.failureReason = null;
                    await paymentRepository().save(payment);
                    notifyPaymentStatus(payment, 'succeeded');
                } else if (intent.status === 'canceled') {
                    payment.status = PaymentStatus.FAILED;
                    payment.failureReason = 'Payment canceled';
                    await paymentRepository().save(payment);
                }
            } catch (syncError) {
                console.warn('Could not sync payment intent from Stripe:', syncError);
            }
        }

        res.json({
            id: payment.id,
            status: payment.status,
            amount: payment.amount,
            currency: payment.currency,
            createdAt: payment.createdAt,
        });
    } catch (error) {
        console.error('Error fetching payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * GET /api/payments — the signed-in user's payment history.
 */
export const getMyPayments = async (req: Request, res: Response) => {
    try {
        const userId = (req as any).user.id;
        const payments = await paymentRepository().find({
            where: { ownerId: userId },
            relations: ['booking'],
            order: { createdAt: 'DESC' },
        });
        res.json(payments);
    } catch (error) {
        console.error('Error fetching payments:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * POST /api/payments/webhook
 *
 * Stripe's server-to-server confirmation. This — not the browser — is the
 * source of truth for whether money actually moved.
 *
 * Includes event idempotency tracking and handles Stripe Connect account updates.
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
    if (!isStripeConfigured() || !stripe) {
        return res.status(503).send('Payments not configured');
    }

    const signature = req.headers['stripe-signature'];

    let event: Stripe.Event;
    try {
        if (!stripeWebhookSecret) {
            console.error('STRIPE_WEBHOOK_SECRET is not set; rejecting webhook');
            return res.status(503).send('Webhook secret not configured');
        }
        event = stripe.webhooks.constructEvent(req.body, signature as string, stripeWebhookSecret);
    } catch (err: any) {
        console.error('Stripe webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        // Enforce idempotency: check if this event has already been processed
        const existingEvent = await webhookEventRepository().findOne({ where: { id: event.id } });
        if (existingEvent) {
            return res.json({ received: true, duplicate: true });
        }

        switch (event.type) {
            case 'payment_intent.succeeded': {
                const intent = event.data.object as Stripe.PaymentIntent;
                const payment = await paymentRepository().findOne({
                    where: { stripePaymentIntentId: intent.id },
                    relations: ['booking', 'booking.owner', 'booking.sitter', 'booking.sitter.user'],
                });
                if (payment && payment.status !== PaymentStatus.SUCCEEDED) {
                    await paymentRepository().update(
                        { stripePaymentIntentId: intent.id },
                        { status: PaymentStatus.SUCCEEDED, failureReason: null }
                    );
                    notifyPaymentStatus(payment, 'succeeded');
                }
                break;
            }
            case 'payment_intent.amount_capturable_updated': {
                const intent = event.data.object as Stripe.PaymentIntent;
                if (intent.status === 'requires_capture') {
                    try {
                        await stripe.paymentIntents.capture(intent.id);
                    } catch (captureErr) {
                        console.error('Error capturing legacy authorized intent in webhook:', captureErr);
                    }
                }
                break;
            }
            case 'payment_intent.payment_failed': {
                const intent = event.data.object as Stripe.PaymentIntent;
                const payment = await paymentRepository().findOne({
                    where: { stripePaymentIntentId: intent.id },
                    relations: ['booking', 'booking.owner', 'booking.sitter', 'booking.sitter.user'],
                });
                if (payment && payment.status !== PaymentStatus.FAILED) {
                    await paymentRepository().update(
                        { stripePaymentIntentId: intent.id },
                        {
                            status: PaymentStatus.FAILED,
                            failureReason: intent.last_payment_error?.message ?? 'Payment failed',
                        }
                    );
                    notifyPaymentStatus(payment, 'failed');
                }
                break;
            }
            case 'payment_intent.canceled': {
                const intent = event.data.object as Stripe.PaymentIntent;
                const payment = await paymentRepository().findOne({
                    where: { stripePaymentIntentId: intent.id },
                    relations: ['booking', 'booking.owner', 'booking.sitter', 'booking.sitter.user'],
                });
                if (payment && payment.status !== PaymentStatus.FAILED) {
                    await paymentRepository().update(
                        { stripePaymentIntentId: intent.id },
                        {
                            status: PaymentStatus.FAILED,
                            failureReason: 'Payment canceled',
                        }
                    );
                }
                break;
            }
            case 'charge.refunded': {
                const charge = event.data.object as Stripe.Charge;
                const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : charge.payment_intent?.id;
                if (paymentIntentId) {
                    const payment = await paymentRepository().findOne({
                        where: { stripePaymentIntentId: paymentIntentId },
                        relations: ['booking', 'booking.owner', 'booking.sitter', 'booking.sitter.user'],
                    });
                    if (payment && payment.status !== PaymentStatus.REFUNDED) {
                        await paymentRepository().update(
                            { stripePaymentIntentId: paymentIntentId },
                            { status: PaymentStatus.REFUNDED }
                        );
                        notifyPaymentStatus(payment, 'refunded');
                    }
                }
                break;
            }
            case 'account.updated': {
                // Stripe Connect Express account update: sync sitter payout onboarding status
                const account = event.data.object as Stripe.Account;
                const profile = await sitterRepository().findOne({
                    where: { stripeConnectAccountId: account.id },
                });
                if (profile) {
                    const newStatus = account.payouts_enabled ? 'ENABLED' : 'PENDING';
                    if (profile.stripeConnectStatus !== newStatus) {
                        profile.stripeConnectStatus = newStatus;
                        await sitterRepository().save(profile);
                    }
                }
                break;
            }
            default:
                break;
        }

        // Record that this webhook event has been successfully processed
        await webhookEventRepository().save({
            id: event.id,
            type: event.type,
            processedAt: new Date(),
        });

        res.json({ received: true });
    } catch (error) {
        console.error('Error handling Stripe webhook:', error);
        res.status(500).send('Webhook handler failed');
    }
};
