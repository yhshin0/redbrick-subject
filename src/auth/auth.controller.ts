import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
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
    console.log(loginUserDto);
    return this.authService.signIn(loginUserDto);
  }
}
