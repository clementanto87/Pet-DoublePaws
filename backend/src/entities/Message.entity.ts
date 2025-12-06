import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { User } from './User.entity';
import { Booking } from './Booking.entity';

@Entity('messages')
export class Message {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    senderId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'senderId' })
    sender: User;

    @Column()
    receiverId: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'receiverId' })
    receiver: User;

    @Column('text')
    content: string;

    @Column({ default: false })
    read: boolean;

    @Column({ nullable: true })
    bookingId: string;

    @Column('text', { nullable: true })
    imageUrl: string;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @CreateDateColumn()
    createdAt: Date;
}
