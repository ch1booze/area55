import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
  Render,
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

  @Post('signin')
  @Redirect()
  async signin(@Body('phoneNumber') phoneNumber: string) {
    await this.usersService.signin(phoneNumber);
    return { url: `/users/verify/?phoneNumber=${phoneNumber}` };
  }

  @Get('signin')
  @Render('signin')
  renderSignin() {}

  @Get('verify')
  @Render('verify')
  renderVerify(@Query('phoneNumber') phoneNumber: string) {
    return { phoneNumber };
  }

  @Post('verify')
  @Redirect()
  async verify(@Body() dto: VerifyOtpDto, @Req() req: Request) {
    await this.usersService.verify(dto, req);
    return { url: '/chats' };
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
