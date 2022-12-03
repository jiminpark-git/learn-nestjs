import {
  Body,
  Controller,
  Get,
  MethodNotAllowedException,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LoginDTO } from './login.dto';
import { AuthService } from './auth.service';
import { JwtGuard } from './jwt.guard';
import { Request, Response } from 'express';
import { RolesGuard } from './roles.guard';
import { Roles } from './roles.decorator';
import { RoleType } from 'src/user/user-role.entity';

const ONE_DAY = 24 * 60 * 60 * 1000;

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
