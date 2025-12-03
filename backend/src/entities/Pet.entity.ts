import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User.entity';

@Entity('pets')
export class Pet {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column()
    name!: string;

    @Column()
    species!: string;

    @Column()
    breed!: string;

    @Column()
    age!: number;

    @Column('float')
    weight!: number;

    @Column({ nullable: true })
    specialNeeds?: string;

    @Column({ nullable: true })
    imageUrl?: string;

    @ManyToOne(() => User, (user) => user.pets)
    @JoinColumn({ name: 'ownerId' })
    owner!: User;

    @Column()
    ownerId!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}
