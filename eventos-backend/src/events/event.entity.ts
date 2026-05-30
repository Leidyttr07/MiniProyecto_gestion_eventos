import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';
import { Category } from '../categories/category.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column()
  start_date: Date;

  @Column()
  end_date: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ default: 30 })
  capacity: number;

  @Column({ default: 30 })
  available_spots: number;

  @Column({ default: 'active' })
  status: 'active' | 'cancelled' | 'finished';

  @ManyToOne(() => Category, { nullable: true, eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'organizer_id' })
  organizer: User;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}