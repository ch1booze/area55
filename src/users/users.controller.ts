import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { VerifyOtpDto } from './users.interfaces';
import { Request } from 'express';
import { AuthGuard } from './auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signin`')
  @HttpCode(HttpStatus.OK)
  async signin(@Body('phoneNumber') phoneNumber: string) {
    return await this.usersService.signin(phoneNumber);
  }

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  async verify(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    return await this.usersService.verify(dto, req);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request) {
    return await this.usersService.logout(req);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async getProfile(@Req() req: Request) {
    return await this.usersService.getProfile(req);
  }
}
