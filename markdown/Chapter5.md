# 5. [NestJS] JWT로 권환 관리 구현하기

## JWT로 권환 관리 구현하기

### 1. 준비

#### 1.1. user_role 테이블 생성

```sql

create table user_role (
    uid      int auto_increment primary key,
    type     varchar(10) null,
    user_uid varchar(36) not null,
    constraint user_role_user_uid_fk
      foreign key (user_uid) references user (uid)
);
```

### 2. Entity and Payload

#### 2.1. user-role.entity.ts

```ts
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
```

#### 2.2. user.entity.ts

```ts
export class User {
  ...

  @OneToMany(() => UserRole, (userRoles) => userRoles.user, {
    cascade: true,
    eager: true,
  })
  userRoles: UserRole[];
}
```

#### 2.3. jwt-payload.interface.ts

```ts
export interface JwtPayload {
  uid: string;
  email: string;
  roles: RoleType[];
}
```

JWT 토큰의 payload에 roles 추가

### 3. Decorator And Guard

#### 3.1. roles.decorator.ts

```ts
export const Roles = (...roles: RoleType[]): any => SetMetadata('roles', roles);
```

`@Roles()` : 데코레이터로 입력한 RoleType을 Guard에서 사용할 수 metadata에 저장

#### 3.2. roles.guard.ts

```ts
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());

    if (!roles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;

    return (
      user && user.roles,
      user.roles.some((userRole) => roles.includes(userRole))
    );
  }
}
```

- Roles 데코레이터에서 설정한 값을 불러온 후, 값이 없으면 true return
- Roles 데코레이터에서 설정한 값을 불러온 후, 값이 있으면 JWT의 payload 내부에 있는 roles에서 해당하는 role이 존재하면 true return

### 4. Service and Controller

#### 4.1. user.service.ts

```ts
@Injectable()
export class UserService {
  ...

  async register(registerDTO: RegisterDTO): Promise<boolean> {
    ...

    await this.userRepository.save({
      email: registerDTO.email,
      password: hashedPassword,
      userRoles: [{ type: RoleType.USER }],
    });
    return true;
  }

  ...
}
```

- `register` : user 저장 시 userRoles 추가

#### 4.2. auth.service.ts

```ts
@Injectable()
export class AuthService {
  ...

  async signToken(user: User) {
    const roles: RoleType[] = user.userRoles.map((userRole) => userRole.type);
    const jwtPayload: JwtPayload = {
      uid: user.uid,
      email: user.email,
      roles: roles,
    };
    const accessToken = await this.signAccessToken(jwtPayload);
    const refreshToken = await this.signRefreshToken(jwtPayload);
    return { accessToken, refreshToken };
  }

  ...
}
```

- `signToken` : 토큰에 roles 추가

#### 4.3. auth.controller.ts

```ts
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDTO: LoginDTO, @Res() response: Response) {
    const token = await this.authService.login(loginDTO);
    response.setHeader('Authorization', `Bearer ${token.accessToken}`);
    return response.json(token);
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async test(@Req() request: Request) {
    console.log(request.user);
    throw new MethodNotAllowedException();
  }

  @UseGuards(JwtGuard)
  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @UseGuards(JwtGuard, RolesGuard)
  @Roles(RoleType.ADMIN)
  @Post('only-admin')
  async onlyAdmin(): Promise<string> {
    return 'Hello, Admin!';
  }
}
```

- `onlyAdmin` : RoleGuard를 사용하여, ADMIN ROLE을 가진 클라이언트만 접근 허용

### 5. Test

#### 5.1. POST http://localhost:3000/auth/only-admin

**response**

```json
{
  "statusCode": 403,
  "message": "Forbidden resource",
  "error": "Forbidden"
}
```

로그인하지 않은 상태 또는 ADMIN 권한이 없는 계정의 토큰을 사용하여 접근한 결과

#### 5.2. POST http://localhost:3000/auth/login

**response**

```
Hello, Admin!
```

ADMIN 권한을 가진 계정의 토큰을 사용하여 접근한 결과
