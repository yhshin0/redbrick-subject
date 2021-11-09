import {
  ConflictException,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

jest.mock('./users.service');

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      jest.spyOn(service, 'createUser').mockResolvedValue(createUser);
      const result = await controller.createUser(createUser);
      expect(result).toMatchObject(createUser);
    });

    it('회원가입 실패, 이미 존재하는 이메일', async () => {
      jest.spyOn(service, 'createUser').mockImplementation(() => {
        throw new ConflictException('이미 가입된 이메일입니다.');
      });
      try {
        await controller.createUser(createUser);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toBe('이미 가입된 이메일입니다.');
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
      jest.spyOn(service, 'updateUser').mockResolvedValue(updatedUser);
      const result = await controller.updateUser(user, updateUserDto);
      expect(result).toMatchObject(updatedUser);
    });

    it('회원 수정 실패', async () => {
      jest.spyOn(service, 'updateUser').mockImplementation(() => {
        throw new InternalServerErrorException(
          '회원 수정에 오류가 발생하였습니다.',
        );
      });
      try {
        const result = await controller.updateUser(user, updateUserDto);
      } catch (e) {
        expect(e).toBeInstanceOf(InternalServerErrorException);
        expect(e.message).toBe('회원 수정에 오류가 발생하였습니다.');
      }
    });
  });
});
