import {
  Body,
  Controller,
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

  @Post('refresh-token')
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }
}
