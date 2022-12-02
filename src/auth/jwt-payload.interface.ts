import { RoleType } from 'src/user/user-role.entity';

export interface JwtPayload {
  uid: string;
  email: string;
  roles: RoleType[];
}
