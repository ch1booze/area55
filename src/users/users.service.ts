import { Injectable } from '@nestjs/common';
import { UserEntity } from './users.entity';
import { Repository } from 'typeorm';
import { SigninUserByEmailDto } from './users.interfaces';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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
