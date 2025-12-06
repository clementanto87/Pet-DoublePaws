import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { User } from './User.entity';
import { Booking } from './Booking.entity';
import { Review } from './Review.entity';

@Entity('sitter_profiles')
export class SitterProfile {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => User, (user) => user.sitterProfile)
    @JoinColumn()
    user!: User;

    @Column()
    userId!: string;

    // Identity & Contact
    @Column({ nullable: true })
    dob?: string;

    @Column({ nullable: true })
    address?: string;

    @Column('float', { nullable: true })
    latitude?: number;

    @Column('float', { nullable: true })
    longitude?: number;

    @Column({ nullable: true })
    phone?: string;

    @Column({ nullable: true })
    governmentIdUrl?: string;

    @Column({ default: false })
    isVerified!: boolean;

    // Service Profile (JSON)
    @Column('simple-json', { nullable: true })
    services?: {
        boarding?: { active: boolean; rate: number; holidayRate?: number };
        houseSitting?: { active: boolean; rate: number; holidayRate?: number };
        dropInVisits?: { active: boolean; rate: number; holidayRate?: number };
        doggyDayCare?: { active: boolean; rate: number; holidayRate?: number };
        dogWalking?: { active: boolean; rate: number; holidayRate?: number };
    };

    @Column({ nullable: true })
    serviceRadius?: number;

    // Preferences (JSON)
    @Column('simple-json', { nullable: true })
    preferences?: {
        acceptedPetTypes: string[]; // ['Dog', 'Cat']
        acceptedPetSizes: string[]; // ['Small', 'Medium']
        isNeuteredOnly: boolean;
        behavioralRestrictions: string[];
    };

    // Housing (JSON)
    @Column('simple-json', { nullable: true })
    housing?: {
        homeType: string;
        outdoorSpace: string;
        hasChildren: boolean;
        hasOtherPets: boolean;
        isNonSmoking: boolean;
    };

    // Experience
    @Column({ nullable: true })
    yearsExperience?: number;

    @Column('simple-array', { nullable: true })
    skills?: string[];

    @Column('simple-array', { nullable: true })
    certifications?: string[];

    @Column({ nullable: true })
    headline?: string;

    @Column('text', { nullable: true })
    bio?: string;

    // Availability (JSON)
    @Column('simple-json', { nullable: true })
    availability?: {
        general: string[]; // ['Weekdays', 'Weekends']
        blockedDates: string[];
    };

    @Column({ nullable: true })
    noticePeriod?: string;

    // Banking (JSON) - Encrypt in real app!
    @Column('simple-json', { nullable: true })
    bankDetails?: any;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Booking, (booking) => booking.sitter)
    bookings!: Booking[];

    @OneToMany(() => Review, (review) => review.sitter)
    reviews!: Review[];
}
