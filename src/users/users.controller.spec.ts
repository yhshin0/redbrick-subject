import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { USER_ERROR_MSG } from './user.constants';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

jest.mock('./users.service');

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(usersController).toBeDefined();
    expect(usersService).toBeDefined();
  });

  const user: User = {
    id: 1,
    email: 'test@gdfsadf.coffm',
    nickname: 'zz',
    loginedAt: new Date(),
    hashPassword: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    projects: null,
    password: 'z',
    games: null,
    likes: null,
  };
  const createUser: User = {
    id: 1,
    email: 'test@gdfsadf.coffm',
    nickname: 'zz',
    loginedAt: new Date(),
    hashPassword: undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    projects: null,
    password: 'z',
    games: null,
    likes: null,
  };

  describe('회원 생성', () => {
    it('회원가입 성공', async () => {
      jest.spyOn(usersService, 'createUser').mockResolvedValue(createUser);
      const result = await usersController.createUser(createUser);
      expect(result).toMatchObject(createUser);
    });

    it('회원가입 실패, 이미 존재하는 이메일', async () => {
      jest.spyOn(usersService, 'createUser').mockImplementation(() => {
        throw new ConflictException(USER_ERROR_MSG.EXISTED_EMAIL);
      });
      try {
        await usersController.createUser(createUser);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe(USER_ERROR_MSG.EXISTED_EMAIL);
      }
    });
  });

  describe('updateUser 회원수정', () => {
    const updatedUser: User = {
      id: 1,
      email: 'test@gdfsadf.coffm',
      nickname: 'ddd',
      loginedAt: new Date(),
      hashPassword: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
      projects: null,
      password: 'z',
      games: null,
      likes: null,
    };
    const updateUserDto: UpdateUserDto = {
      password: '123',
      nickname: 'zz',
    };

    it('회원 수정 성공', async () => {
      jest.spyOn(usersService, 'updateUser').mockResolvedValue(updatedUser);
      const result = await usersController.updateUser(user, updateUserDto);
      expect(result).toMatchObject(updatedUser);
    });

    it('회원 수정 실패', async () => {
      jest.spyOn(usersService, 'updateUser').mockImplementation(() => {
        throw new InternalServerErrorException(
          USER_ERROR_MSG.UPDATE_INTERNAL_SERVER_ERROR,
        );
      });
      try {
        const result = await usersController.updateUser(user, updateUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe(USER_ERROR_MSG.UPDATE_INTERNAL_SERVER_ERROR);
      }
    });
  });
});
