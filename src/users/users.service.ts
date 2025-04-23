import { Inject, Injectable } from '@nestjs/common';
import { User } from './users.entity';
import { Repository } from 'typeorm';
import { SigninUserByEmailDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject('USER_REPOSITORY') private userRepository: Repository<User>,
  ) {}

  async signinUserByEmail(signinUserByEmailDto: SigninUserByEmailDto) {
    const { email } = signinUserByEmailDto;
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new Error('User already exists');
    }
    return user;
  }

  async verifyUserByEmail(token: string) {
    const user = await this.userRepository.findOne({ where: { email: token } });
    if (!user) {
      throw new Error('User not found');
    }
    await this.userRepository.save(user);
    return user;
  }
}
