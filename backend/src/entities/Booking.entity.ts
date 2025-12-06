import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { SitterProfile } from './SitterProfile.entity';

export enum BookingStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
}

@Entity()
export class Booking {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    sitterId: string;

    @ManyToOne(() => SitterProfile)
    @JoinColumn({ name: 'sitterId' })
    sitter: SitterProfile;

    @Column()
    ownerId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'ownerId' })
    owner: User;

    @Column('simple-array', { nullable: true })
    petIds: string[];

    @Column()
    serviceType: string;

    @Column()
    startDate: Date;

    @Column()
    endDate: Date;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    status: BookingStatus;

    @Column('decimal', { precision: 10, scale: 2 })
    totalPrice: number;

    @Column('text', { nullable: true })
    message: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
