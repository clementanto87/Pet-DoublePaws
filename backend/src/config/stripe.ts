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

/** Default platform commission percentage (e.g. 10%). Configurable via PLATFORM_FEE_PERCENT env. */
export const platformFeePercent = Math.max(0, Math.min(100, Number(process.env.PLATFORM_FEE_PERCENT) || 10));

/**
 * Calculates the platform commission (fee) and the net amount owed to the sitter.
 */
export const calculateFeeSplit = (totalAmountInCents: number) => {
    const platformFeeAmount = Math.round(totalAmountInCents * (platformFeePercent / 100));
    const sitterAmount = Math.max(0, totalAmountInCents - platformFeeAmount);
    return {
        platformFeeAmount,
        sitterAmount,
    };
};

/**
 * Retrieves or creates a Stripe Customer object for a given user.
 */
export const getOrCreateStripeCustomer = async (user: { id: string; email: string; firstName?: string; lastName?: string; stripeCustomerId?: string }): Promise<string | null> => {
    if (!stripe) return null;

    if (user.stripeCustomerId) {
        return user.stripeCustomerId;
    }

    try {
        const customer = await stripe.customers.create({
            email: user.email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
            metadata: {
                userId: user.id,
            },
        });
        return customer.id;
    } catch (error) {
        console.error('Error creating Stripe customer:', error);
        return null;
    }
};

