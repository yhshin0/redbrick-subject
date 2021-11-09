import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './get-user.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  signIn(@Body() loginUserDto: LoginUserDto): Promise<{ accessToken }> {
    return this.authService.signIn(loginUserDto);
  }

  @Post('/signout')
  @UseGuards(JwtAuthGuard)
  async logout(@GetUser() user: User): Promise<{ message: string }> {
    await this.authService.signOut(user);
    return { message: '로그아웃 되었습니다.' };
  }
}
