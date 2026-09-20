import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { Booking } from './Booking.entity';
import { User } from './User.entity';

export enum PaymentStatus {
    /** PaymentIntent created, awaiting customer confirmation */
    PENDING = 'PENDING',
    /** Funds captured successfully */
    SUCCEEDED = 'SUCCEEDED',
    /** Stripe reported a failure (declined card, etc.) */
    FAILED = 'FAILED',
    /** Refunded back to the customer */
    REFUNDED = 'REFUNDED',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    bookingId: string;

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    /** The owner (payer) — denormalized so we can list a user's payments cheaply. */
    @Column()
    ownerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ownerId' })
    owner: User;

    /** Stripe PaymentIntent id (pi_...). Unique so a booking can't be double-charged. */
    @Column({ unique: true })
    stripePaymentIntentId: string;

    /**
     * Amount in the currency's smallest unit (cents) — Stripe's convention.
     * Stored as an integer to avoid floating-point rounding on money.
     */
    @Column('int')
    amount: number;

    /** Platform fee in cents retained by Double Paws. */
    @Column('int', { nullable: true })
    platformFeeAmount?: number;

    /** Net amount in cents transferred to the sitter's connected account. */
    @Column('int', { nullable: true })
    sitterAmount?: number;

    /** Stripe Transfer ID (tr_...) or charge destination if applicable. */
    @Column({ nullable: true })
    stripeTransferId?: string;

    /** Stripe Refund ID (re_...) if a refund was issued. */
    @Column({ nullable: true })
    stripeRefundId?: string;

    @Column({ default: 'eur' })
    currency: string;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING,
    })
    status: PaymentStatus;

    /** Last error message from Stripe, if the payment failed. */
    @Column('text', { nullable: true })
    failureReason: string | null;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
