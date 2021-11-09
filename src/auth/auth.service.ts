import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signIn(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;
    const user = await this.usersService.findOne(email);

    // 로그인한 유저 비밀번호와 디비에 저장된 비밀번호 비교
    if (user && (await bcrypt.compare(password, user.password))) {
      // 유저 로그인 시각 갱신
      const loginedAt = new Date();
      await this.usersService.updateLoginedAt(email, loginedAt);

      // payload로 토큰 생성
      const payload = { email, loginedAt };
      const accessToken = await this.jwtService.sign(payload);

      return { accessToken };
    } else {
      throw new UnauthorizedException('login fail');
    }
  }

  async signOut(user: User) {
    const { email } = user;
    const result = await this.usersService.findOne(email);
    await this.usersService.updateLoginedAt(result.email, null);
  }
}
