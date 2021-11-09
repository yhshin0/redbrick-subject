import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly usersSerivce: UsersService,
    private readonly configService: ConfigService,
  ) {
    super({
      secretOrKey: configService.get('JWT_SECRET'),
      ignoreExpiration: false,
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    });
  }

  async validate(payload: any) {
    const { email, loginedAt } = payload;
    const user: User = await this.usersSerivce.findOne(email);

    const tokenLoginedAt = new Date(loginedAt).getTime();
    const userLoginedAt = new Date(user.loginedAt).getTime();

    if (!user || tokenLoginedAt !== userLoginedAt) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
