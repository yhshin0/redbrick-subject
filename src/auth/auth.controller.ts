import { Body, Controller, Post, UseGuards } from '@nestjs/common';

import { User } from '../users/entities/user.entity';
import { AUTH_CONSTANTS } from './auth.constants';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  signIn(@Body() loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    return this.authService.signIn(loginUserDto);
  }

  @Post('/signout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() user: User): Promise<{ message: string }> {
    await this.authService.signOut(user);
    return { message: AUTH_CONSTANTS.LOGOUT_MSG };
  }
}
