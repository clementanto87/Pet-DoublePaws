import Stripe from 'stripe';

/**
 * Stripe client.
 *
 * Configured entirely from env so no key is ever committed:
 *   STRIPE_SECRET_KEY      sk_test_... (test mode) / sk_live_... (production)
 *   STRIPE_WEBHOOK_SECRET  whsec_...   (from `stripe listen` or the dashboard)
 *   STRIPE_CURRENCY        optional, defaults to eur
 *
 * Payments are simply unavailable (endpoints return 503) when the key is
 * missing, so the rest of the app keeps working in environments without it.
 */
const secretKey = process.env.STRIPE_SECRET_KEY;

export const stripe = secretKey ? new Stripe(secretKey) : null;

export const isStripeConfigured = (): boolean => Boolean(stripe);

export const stripeCurrency = (process.env.STRIPE_CURRENCY || 'eur').toLowerCase();

export const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

/** True when running against Stripe test keys — surfaced to the UI as a sandbox badge. */
export const isStripeTestMode = (): boolean => Boolean(secretKey?.startsWith('sk_test_'));
