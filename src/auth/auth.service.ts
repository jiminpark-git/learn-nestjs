import { Body, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { LoginDTO } from './login.dto';
import { compare } from 'bcrypt';
import { User } from 'src/user/user.entity';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from './jwtPayload.interface';

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
