import { Controller, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { SigninUserByEmailDto } from './users.interfaces';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('signin/phone')
  async signinUserByPhoneNumber(@Query('phoneNumber') phoneNumber: string) {
    return 'Logged in successfully with phone number';
  }

  @Post('signin/email')
  async signinUserByEmail(@Query() signinUserByEmailDto: SigninUserByEmailDto) {
    return await this.usersService.signinUserByEmail(signinUserByEmailDto);
  }

  @Post('verify/email')
  async verifyUserByEmail(@Query('token') token: string) {
    return await this.usersService.verifyUserByEmail(token);
  }

  @Post('signin/google')
  async signinUserByGoogle(@Query('idToken') idToken: string) {
    return 'Logged in successfully with Google';
  }
}
