import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

  @Get('/test')
  @UseGuards(AuthGuard())
  test(@GetUser() ok: string) {
    console.log('fs' + ok);
  }

  @Get('/test2')
  test2() {
    console.log('f');
  }
}
