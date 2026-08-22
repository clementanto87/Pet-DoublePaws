import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User.entity';
import { Booking } from './Booking.entity';

export enum SupportRequestType {
    DISPUTE = 'DISPUTE',
    SUPPORT = 'SUPPORT',
}

export enum SupportRequestStatus {
    OPEN = 'OPEN',
    IN_PROGRESS = 'IN_PROGRESS',
    RESOLVED = 'RESOLVED',
    CLOSED = 'CLOSED',
}

@Entity('support_requests')
export class SupportRequest {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    reporterId!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'reporterId' })
    reporter!: User;

    @Column({ nullable: true })
    bookingId?: string;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'bookingId' })
    booking?: Booking;

    @Column({ type: 'enum', enum: SupportRequestType })
    type!: SupportRequestType;

    @Column({ length: 160 })
    subject!: string;

    @Column('text')
    description!: string;

    @Column({ type: 'enum', enum: SupportRequestStatus, default: SupportRequestStatus.OPEN })
    status!: SupportRequestStatus;

    @Column('text', { nullable: true })
    adminResponse?: string;

    @Column({ nullable: true })
    firstResponseAt?: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
