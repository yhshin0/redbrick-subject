import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async signIn(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.userService.findOne(email);

    // 로그인한 유저 비밀번호와 디비에 저장된 비밀번호 비교
    if (user && (await bcrypt.compare(password, user.password))) {
      // 유저 로그인 시각 갱신
      const loginedAt = new Date();
      await this.userService.updateLoginedAt(email, loginedAt);

      // payload로 토큰 생성
      const payload = { email };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException('login fail');
    }
  }
}
