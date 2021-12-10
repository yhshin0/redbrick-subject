import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { AUTH_ERROR_MSG } from './auth.constants';

jest.mock('../users/users.service');

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        UsersService,
        { provide: JwtService, useValue: { sign: jest.fn(() => 'TOKEN') } },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect.assertions(3);
    expect(authService).toBeDefined();
    expect(usersService).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  describe('login', () => {
    it('로그인: 성공', async () => {
      const findUser: User = {
        id: 1,
        email: 'test@gdfsadf.coffm',
        nickname: 'ddd',
        loginedAt: new Date(),
        hashPassword: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        projects: null,
        password: '1',
        games: null,
        likes: null,
      };
      const user = { email: 'test@gdfsadf.coffm', password: '1' };
      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;
      jest.spyOn(jwtService, 'sign').mockReturnValue('TOKEN');
      jest.spyOn(usersService, 'findOne').mockResolvedValue(findUser);
      const result = await authService.signIn(user);
      expect(result).toMatchObject({ accessToken: 'TOKEN' });
    });

    it('user가 존재하지 않아 로그인에 실패한다', async () => {
      expect.assertions(2);
      const email = 'testuser@asdf.com';
      const password = 'password';
      const loginUserDto = new LoginUserDto();
      loginUserDto.email = email;
      loginUserDto.password = password;

      jest.spyOn(usersService, 'findOne').mockResolvedValue(null);
      try {
        const result = await authService.signIn(loginUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toEqual(AUTH_ERROR_MSG.LOGIN_FAIL);
      }
    });
  });

  describe('logout', () => {
    it('로그아웃: 성공', async () => {
      const email = 'testuser@asdf.com';
      const user = new User();
      user.email = email;
      const findUser: User = {
        id: 1,
        email: email,
        nickname: 'ddd',
        loginedAt: new Date(),
        hashPassword: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        projects: null,
        password: '1',
        games: null,
        likes: null,
      };
      jest.spyOn(usersService, 'findOne').mockResolvedValue(findUser);
      jest.spyOn(usersService, 'updateLoginedAt').mockResolvedValue(undefined);
      const result = await authService.signOut(user);
      expect(result).toBe(undefined);
    });
  });
});
