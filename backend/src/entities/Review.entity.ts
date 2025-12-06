import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Booking } from './Booking.entity';
import { SitterProfile } from './SitterProfile.entity';

@Entity()
export class Review {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    bookingId: string;

    @ManyToOne(() => Booking)
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

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

    @Column('int')
    rating: number;

    @Column('text')
    comment: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
