import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import { User } from '../users/entities/user.entity';

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
  });

  describe('logout', () => {
    it('로그아웃: 성공', async () => {
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
      jest.spyOn(usersService, 'findOne').mockResolvedValue(findUser);
      jest.spyOn(usersService, 'updateLoginedAt').mockResolvedValue(null);
    });
  });
});
