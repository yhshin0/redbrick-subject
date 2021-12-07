import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AUTH_ERROR_MSG } from './auth.constants';

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

  async validate({
    email,
    loginedAt,
  }: {
    email: string;
    loginedAt: Date;
  }): Promise<User> {
    const user: User = await this.usersSerivce.findOne(email);

    if (!user) {
      throw new UnauthorizedException(AUTH_ERROR_MSG.INVALID_TOKEN);
    }

    const tokenLoginedAt = new Date(loginedAt).getTime();
    const userLoginedAt = new Date(user.loginedAt).getTime();

    if (tokenLoginedAt !== userLoginedAt) {
      throw new UnauthorizedException(AUTH_ERROR_MSG.INVALID_TOKEN);
    }

    return user;
  }
}
