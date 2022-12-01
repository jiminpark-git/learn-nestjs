# 4. [NestJS] JWT로 로그인 구현하기

## JWT(JSON Web Token)

> JSON 웹 토큰은 선택적 서명 및 선택적 암호화를 사용하여 데이터를 만들기 위한 인터넷 표준으로, 페이로드는 몇몇 클레임 표명을 처리하는 JSON을 보관하고 있다. 토큰은 **비공개 시크릿 키 또는 공개/비공개 키**를 사용하여 서명된다. - [wikipedia](https://ko.wikipedia.org/wiki/JSON_%EC%9B%B9_%ED%86%A0%ED%81%B0)

### JWT의 구성요소

|   구성요소    | 설명                |
| :-----------: | ------------------- |
|  **Header**   | 서명 알고리즘       |
|  **Payload**  | 토큰 내용, 유효기간 |
| **Signature** | 보안 서명           |

## JWT로 로그인 구현하기

### 1. 준비

#### 1.1. 패키지 설치

- `bcrypt` : 암호를 해시 암호화를 도와주는 라이브러리
- `@nestjs/jwt` : NestJS용 JWT 패키지
- `passport-jwt` : Passport 인증 Strategy

```bash
$ yarn add bcrypt @nestjs/jwt @nestjs/passport passport-jwt
$ yarn add -D @types/bcrypt @types/passport-jwt
```

#### 1.2. user 테이블 생성

```sql
create table user (
    uid      varchar(36)  not null primary key,
    email    varchar(30)  not null,
    password varchar(100) not null,
    constraint user_pk unique (email)
);
```

### 2. [User] Entity and DTO

#### 2.1. user.entity.ts

```ts
@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  uid: string;

  @Column({ type: 'varchar', length: 30 })
  @IsEmail()
  email: string;

  @Column({ type: 'varchar', length: 100 })
  password: string;
}
```

user 테이블의 Entity

#### 2.2. register.dto.ts

```ts
export class RegisterDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
```

회원가입 시 컨트롤러에서 입력 받을 데이터의 DTO

### 3. [User] Service and Controller

#### 3.1. user.service.ts

```ts
@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOne({ where: { email } });
  }

  async register(registerDTO: RegisterDTO): Promise<boolean> {
    const user = await this.getOneByEmail(registerDTO.email);
    if (user) {
      throw new BadRequestException('This id is already used');
    }

    const hashedPassword = await this.hashPassword(registerDTO.password);
    await this.userRepository.save({
      email: registerDTO.email,
      password: hashedPassword,
    });
    return true;
  }

  async hashPassword(password: string) {
    return hash(password, 10); // salt 10
  }
}
```

- `getOneByEmail` : 이메일로 user 찾기
- `register` : 회원가입 로직
- `hashPassword` : 비밀번호 해시 암호화 (salt 10)

#### 3.2. user.controller.ts

```ts
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerDTO: RegisterDTO) {
    return this.userService.register(registerDTO);
  }
}
```

### 4. [User] Test

#### 4.1. POST http://localhost:3000/user/register

**body**

```json
{
  "email": "jiminpark.dev@gmail.com",
  "password": "password"
}
```

**response**

회원가입 성공 시 `true` 반환

### 5. [Auth] DTO and Interface

#### 5.1. login.dto.ts

```ts
export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
```

로그인 시 컨트롤러에서 입력 받을 데이터의 DTO

#### 5.2. jwtPayload.interface.ts

```ts
export interface JwtPayload {
  uid: string;
  email: string;
}
```

JWT Payload 사용될 인터페이스

### 6. [Auth] Service and Controller

#### 6.1. auth.service.ts

```ts
@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(loginDTO: LoginDTO) {
    const user = await this.validateUser(loginDTO);
    const token = await this.signToken(user);
    return token;
  }

  async validateUser(loginDTO: LoginDTO): Promise<User> {
    const user = await this.userService.getOneByEmail(loginDTO.email);
    const isPasswordMatch = await compare(loginDTO.password, user.password);
    if (!user || !isPasswordMatch) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async signToken(user: User) {
    const jwtPayload: JwtPayload = { uid: user.uid, email: user.email };
    const accessToken = await this.signAccessToken(jwtPayload);
    const refreshToken = await this.signRefreshToken(jwtPayload);
    return { accessToken, refreshToken };
  }

  async signAccessToken(jwtPayload: JwtPayload) {
    return this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
  }

  async signRefreshToken(jwtPayload: JwtPayload) {
    return this.jwtService.signAsync(jwtPayload, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRATION'),
    });
  }

  async refreshToken(@Body() refreshToken: string) {
    const jwtPayload = await this.jwtService.verifyAsync(refreshToken, {
      secret: this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET'),
    });
    const user = await this.userService.getOneByEmail(jwtPayload.email);
    const token = this.signToken(user);
    return token;
  }
}
```

- `login` : user 확인 후 해당 user 데이터로 accessToken과 refreshToken 생성 후 return
- `validateUser` : user 확인 후 user 데이터 return 매치하는 데이터가 없을 시 **UnauthorizedException** throw
- `signToken` : user 데이터로 accessToken과 refreshToken 생성 후 return
- `refreshToken` : refreshToken으로 token 갱신

#### 6.2. auth.controller.ts

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
  async logout(@Req() request: Request) {
    console.log(request.user);
    throw new MethodNotAllowedException();
  }

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
```

- `GET auth/login` : 로그인 후 header에 Authorization 설정
- `POST auth/logout` : @UseGuard() 어노테이션으로 JWT 인증 된 사용자만 입장 가능
- `POST auth/refresh-token` : Refresh token

### 7. [JWT] Strategy and Guard

#### 7.1. jwt.strategy.ts

```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN_SECRET'),
    });
  }

  async validate(jwtPayload: JwtPayload) {
    const user = this.userService.getOneByEmail(jwtPayload.email);
    if (!user) {
      throw new UnauthorizedException();
    }
    return jwtPayload;
  }
}
```

#### 7.2. jwt.guard.ts

```ts
@Injectable()
export class JwtGuard extends AuthGuard('jwt') {}
```

### 8. [Auth, JWT] Test

#### 8.1. POST http://localhost:3000/auth/logout

**response**

```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

로그인 하지 않은 상태에서 접근하여 `401 Error`

#### 8.2. POST http://localhost:3000/auth/login

**body**

```json
{
  "email": "jiminpark.dev@gmail.com",
  "password": "password"
}
```

**response**

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

로그인 후 accessToken, refreshToken 반환

#### 8.3. POST http://localhost:3000/auth/refresh-token

**body**

```json
{
  "refreshToken": "..."
}
```

**repsonse**

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

refershToken으로 accessToken 갱신 후 accessToken, refreshToken 반환

#### 8.4. POST http://localhost:3000/auth/logout

**header**

Authorization : Bearer {accessToken}

**response**

```json
{
  "statusCode": 405,
  "message": "Method Not Allowed"
}
```

로그인 후 logout, 현재 로그아웃 로직 구현이 되지 않았기에 `405 Error`
