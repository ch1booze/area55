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

  async createOrFindUser(phoneNumber: string) {
    const existingUser = await this.userRepository.findOne({
      where: { phoneNumber },
    });

    if (existingUser) {
      return existingUser;
    }

    const userEntity = new UserEntity();
    userEntity.phoneNumber = phoneNumber;
    return await this.userRepository.save(userEntity);
  }

  async signin(phoneNumber: string) {
    totp.options = { window: 30 };
    const token = totp.generate(this.configService.get<string>('OTP_SECRET')!);
    await this.chatbotService.sendMessage({
      messaging_product: 'whatsapp',
      to: phoneNumber.replace('+', ''),
      type: 'text',
      text: { body: `Your OTP is ${token}` },
    });

    await this.createOrFindUser(phoneNumber);
  }

  async verify(dto: VerifyOtpDto, req: Request) {
    const isValid = totp.verify({
      token: dto.token,
      secret: this.configService.get<string>('OTP_SECRET')!,
    });

    if (!isValid) {
      throw new UnauthorizedException('Invalid OTP');
    }

    const user = await this.createOrFindUser(dto.phoneNumber);
    req.session.userId = user.id;
    req.session.isAuthenticated = true;
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
