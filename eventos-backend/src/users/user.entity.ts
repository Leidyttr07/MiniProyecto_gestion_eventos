import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 100 })
  name!: string;

  @Column({ length: 100, nullable: true })
  last_name?: string;

  @Column({ length: 20, nullable: true })
  student_code?: string;

  @Column({ length: 150, nullable: true })
  program?: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column()
  @Exclude()
  password!: string;

  @Column({ default: 'participant' })
  role!: 'admin' | 'participant';

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;

  @Column({ nullable: true })
  @Exclude()
  refresh_token?: string;
}