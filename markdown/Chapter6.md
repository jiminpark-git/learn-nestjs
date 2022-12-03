# 6. [NestJS] 쿠키 관리

## 쿠키

> HTTP 쿠키(HTTP cookie)란 하이퍼 텍스트의 기록서(HTTP)의 일종으로서 인터넷 사용자가 어떠한 웹사이트를 방문할 경우 사용자의 웹 브라우저를 통해 인터넷 사용자의 컴퓨터나 다른 **기기에 설치되는 작은 기록 정보** 파일을 일컫는다. - [wikipedia](https://ko.wikipedia.org/wiki/HTTP_%EC%BF%A0%ED%82%A4#cite_note-1)

## 쿠키 관리

### 1. 준비

```bash
$ yarn add cookie-parser
$ yarn add -D @types/cookie-parser
```

### 2. Controller and main.ts

#### 2.1. auth.controller.ts

```ts
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDTO: LoginDTO, @Res() response: Response) {
    const token = await this.authService.login(loginDTO);
    response.setHeader('Authorization', `Bearer ${token.accessToken}`);
    response.cookie('jwt', token.accessToken, {
      httpOnly: true,
      maxAge: ONE_DAY,
    });
    return response.send({ success: true });
  }

  @UseGuards(JwtGuard)
  @Post('logout')
  async test(@Req() request: Request, @Res() response: Response) {
    response.cookie('jwt', { maxAge: 0 });
    return response.send({ success: true });
  }

  ...
}
```

- `httpOnly` : 외부의 쿠키 접근을 막음 (XSS 공격 보호)
- `maxAge` : 쿠키의 유효기간

#### 2.2. main.ts

```ts
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  ...
  app.use(cookieParser()); // cookieParser 사용
  await app.listen(port);
}
bootstrap();
```

cookieParser 사용

### 3. Test

#### 3.1. POST /auth/login

**body**

```json
{
  "email": "jiminpark.admin@gmail.com",
  "password": "password"
}
```

**cookies**

| Name | Value |
| ---- | ----- |
| jwt  | ...   |

jwt cookie에 accessToken을 넣어 return

#### 3.2. POST /auth/logout

**response**

```json
{
  "success": true
}
```
