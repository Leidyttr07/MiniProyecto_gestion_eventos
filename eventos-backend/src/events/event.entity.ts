import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn()
  id: number = 0;

  @Column({ length: 200 })
  title: string = '';

  @Column({ nullable: true })
  description: string = '';

  @Column()
  start_date: Date = new Date();

  @Column()
  end_date: Date = new Date();

  @Column({ nullable: true })
  location: string = '';

  @Column({ default: 30 })
  capacity: number = 30;

  @Column({ default: 30 })
  available_spots: number = 30;

  @Column({ default: 'active' })
  status: string = 'active';

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'organizer_id' })
  organizer!: User;

  @CreateDateColumn()
  created_at: Date = new Date();

  @UpdateDateColumn()
  updated_at: Date = new Date();

  @Column({ nullable: true })
  event_type: string = '';

  @Column({ nullable: true })
  program: string = '';
}