import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserEntity } from './users.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChatbotService } from 'src/chatbot/chatbot.service';
import { totp } from 'otplib';
import { ConfigService } from '@nestjs/config';
import { VerifyOtpDto } from './users.interfaces';
import { Request } from 'express';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly chatbotService: ChatbotService,
    private readonly configService: ConfigService,
  ) {}

  async signin(phoneNumber: string) {
    const token = totp.generate(this.configService.get<string>('OTP_SECRET')!);
    await this.chatbotService.sendMessage({
      messaging_product: 'whatsapp',
      to: phoneNumber,
      type: 'text',
      text: { body: `Your OTP is ${token}` },
    });

    const foundUserEntity = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (!foundUserEntity) {
      const userEntity = new UserEntity();
      userEntity.phoneNumber = phoneNumber;

      await this.userRepository.save(userEntity);
    }
  }

  async verify(dto: VerifyOtpDto, req: Request) {
    const isValid = totp.check(
      dto.token,
      this.configService.get<string>('OTP_SECRET')!,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const user = await this.userRepository.findOne({
      where: { phoneNumber: dto.phoneNumber },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    req.session.userId = user.id;
    req.session.isAuthenticated = true;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    };
  }

  async getProfile(req: Request) {
    const userId = req.session.userId;

    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      phoneNumber: user.phoneNumber,
    };
  }

  async logout(req: Request) {
    try {
      await new Promise<void>((resolve, reject) => {
        req.session.destroy((err) => {
          if (err) {
            reject(err instanceof Error ? err : new Error(String(err)));
          } else {
            resolve();
          }
        });
      });

      return { message: 'Signed out successfully' };
    } catch (error) {
      throw error instanceof Error ? error : new Error(String(error));
    }
  }
}
