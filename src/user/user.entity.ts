import { IsEmail } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRole } from './user-role.entity';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column({ type: 'varchar', length: 30 })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;

  @OneToMany(() => UserRole, (userRoles) => userRoles.user, {
    cascade: true,
    eager: true,
  })
  userRoles: UserRole[];
}
