import { SetMetadata } from '@nestjs/common';
import { RoleType } from 'src/user/user-role.entity';

export const Roles = (...roles: RoleType[]): any => SetMetadata('roles', roles);
