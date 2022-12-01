import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RegisterDTO } from './register.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('register')
  async register(@Body() registerDTO: RegisterDTO) {
    return this.userService.register(registerDTO);
  }
}
