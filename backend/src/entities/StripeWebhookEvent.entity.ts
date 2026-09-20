import { Entity, PrimaryColumn, Column, CreateDateColumn } from 'typeorm';

/**
 * Stores Stripe event IDs that have already been processed to prevent
 * duplicate processing when Stripe retries webhook delivery.
 */
@Entity('stripe_webhook_events')
export class StripeWebhookEvent {
    /** The Stripe event ID, e.g. evt_123456789 */
    @PrimaryColumn()
    id!: string;

    @Column()
    type!: string;

    @CreateDateColumn()
    processedAt!: Date;
}
