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
