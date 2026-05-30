import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany
} from 'typeorm';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100, unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;
}