import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { User } from '../users/user.entity';
import { Event } from '../events/event.entity';

@Entity('registrations')
export class Registration {
  @PrimaryGeneratedColumn()
  id!: number;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @ManyToOne(() => Event, { eager: true })
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @Column({ default: 'active' })
  status!: 'active' | 'cancelled';

  @CreateDateColumn()
  registered_at!: Date;

  @Column({ default: false })
  removed_by_admin!: boolean;
}