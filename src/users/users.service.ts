import { ConflictException, Injectable } from '@nestjs/common';
import { UserEntity } from './users.entity';
import { Repository } from 'typeorm';
import { SigninUserByPhoneDto } from './users.interfaces';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async signinUserByPhone(dto: SigninUserByPhoneDto) {
    const { phoneNumber, name } = dto;

    const foundUserEntity = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (foundUserEntity) {
      throw new ConflictException('User already exists');
    }

    const userEntity = new UserEntity();
    userEntity.phoneNumber = phoneNumber;
    userEntity.name = name;

    await this.userRepository.save(userEntity);
    return userEntity;
  }
}
