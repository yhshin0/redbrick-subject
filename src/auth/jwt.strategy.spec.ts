import { UnauthorizedException } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AUTH_ERROR_MSG } from './auth.constants';
import { JwtStrategy } from './jwt.strategy';

jest.mock('../users/users.service');

describe('JwtStrategy', () => {
  let jwtStrategy: JwtStrategy;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [
        JwtStrategy,
        UsersService,
        { provide: ConfigService, useValue: { get: () => 'SECRET' } },
      ],
    }).compile();

    jwtStrategy = module.get<JwtStrategy>(JwtStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(jwtStrategy).toBeDefined();
    expect(usersService).toBeDefined();
  });

  describe('validate', () => {
    const email = 'testuser@asdf.com';
    const loginedAt = new Date();

    it('jwt 유효성 검사에 성공한다', async () => {
      const user = new User();
      user.loginedAt = loginedAt;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      const result = await jwtStrategy.validate({ email, loginedAt });
      expect(result).toMatchObject(user);
    });

    it('일치하는 유저가 없어서 jwt 유효성 검사에 실패한다', async () => {
      expect.assertions(2);
      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);

      try {
        const result = await jwtStrategy.validate({ email, loginedAt });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(AUTH_ERROR_MSG.INVALID_TOKEN);
      }
    });

    it('토큰의 로그인 시각과 DB의 유저 로그인 시각이 달라 jwt 유효성 검사에 실패한다', async () => {
      expect.assertions(2);

      const user = new User();
      user.loginedAt = new Date();

      jest.spyOn(usersService, 'findOne').mockResolvedValue(user);

      try {
        const result = await jwtStrategy.validate({ email, loginedAt });
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(AUTH_ERROR_MSG.INVALID_TOKEN);
      }
    });
  });
});
