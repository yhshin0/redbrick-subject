import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { GetUser } from './get-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('/signin')
  signIn(@Body() loginUserDto: LoginUserDto): Promise<{ accessToken }> {
    return this.authService.signIn(loginUserDto);
  }

  @Post('/signout')
  async logout(@GetUser() user: LoginUserDto): Promise<{ message: string }> {
    await this.authService.signOut(user);
    return { message: '로그아웃 되었습니다.' };
  }
}
