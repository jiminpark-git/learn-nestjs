import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'user_role' })
export class UserRole {
  @PrimaryGeneratedColumn('increment')
  uid: number;

  @Column({ type: 'varchar', length: 10 })
  type: RoleType;

  @ManyToOne(() => User, (user) => user.userRoles)
  @JoinColumn({ name: 'user_uid' })
  user: User;
}

export enum RoleType {
  USER = 'USER',
  ADMIN = 'ADMIN',
}
