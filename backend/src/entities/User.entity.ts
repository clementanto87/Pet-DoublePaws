import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, OneToOne } from 'typeorm';
import { Pet } from './Pet.entity';
import { SitterProfile } from './SitterProfile.entity';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ unique: true })
    email!: string;

    @Column({ nullable: true, select: false }) // Password might be null for Google Auth users
    password?: string;

    @Column()
    firstName!: string;

    @Column()
    lastName!: string;

    @Column({ nullable: true, unique: true })
    googleId?: string;

    @CreateDateColumn()
    createdAt!: Date;
    @UpdateDateColumn()
    updatedAt!: Date;

    @OneToMany(() => Pet, (pet) => pet.owner)
    pets!: Pet[];

    @OneToOne(() => SitterProfile, (profile) => profile.user)
    sitterProfile?: SitterProfile;


}
