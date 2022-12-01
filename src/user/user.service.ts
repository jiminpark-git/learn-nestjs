import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RegisterDTO } from './register.dto';
import { User } from './user.entity';
import { hash } from 'bcrypt';

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
