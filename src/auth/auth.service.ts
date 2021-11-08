import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async signIn(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;

    // if (user && (await bcrypt.compare(password, user.password))) {
    //   // 유저 토큰 생성 (Secret + Payload)
    //   const payload = { username };
    //   const accessToken = await this.jwtService.sign(payload);
    //   return { accessToken };
    // } else {
    //   throw new UnauthorizedException('login fail');
    // }

    if (password == '1') {
      const paylod = { email };
      const accessToken = await this.jwtService.sign(paylod);
      return { accessToken };
    } else {
      throw new UnauthorizedException('login fail');
    }
  }
}
