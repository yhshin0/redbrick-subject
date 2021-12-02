import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { USER_ERROR_MSG } from './user.constants';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let usersService: UsersService;
  let usersRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository() },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersRepository = module.get<MockRepository<User>>(
      getRepositoryToken(User),
    );
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(usersService).toBeDefined();
    expect(usersRepository).toBeDefined();
  });

  describe('createUser', () => {
    const email = 'testuser@gasdf.com';
    const password = 'password';
    const nickname = 'nickname';
    const createUserDto = new CreateUserDto();
    createUserDto.email = email;
    createUserDto.password = password;
    createUserDto.nickname = nickname;

    const user = new User();
    user.email = email;
    user.nickname = nickname;

    it('유저 생성에 성공한다', async () => {
      usersRepository.findOne.mockResolvedValue(undefined);
      usersRepository.save.mockResolvedValue(user);
      const result = await usersService.createUser(createUserDto);

      expect(result).toMatchObject(user);
    });

    it('이메일이 존재하여 회원가입에 실패한다', async () => {
      expect.assertions(2);
      usersRepository.findOne.mockResolvedValue(user);

      try {
        const result = await usersService.createUser(user);
      } catch (error) {
        expect(error).toBeInstanceOf(ConflictException);
        expect(error.message).toEqual(USER_ERROR_MSG.EXISTED_EMAIL);
      }
    });
  });

  describe('updateUser', () => {
    it('유저 수정에 성공한다', async () => {
      expect.assertions(2);
      const email = 'testuser@gasdf.com';
      const password = 'password';
      const nickname = 'nickname';

      const updatePassword = 'P@ssw0rd';
      const updateNickname = 'NICKNAME';
      const updateUserDto = new UpdateUserDto();
      updateUserDto.nickname = updateNickname;
      updateUserDto.password = updatePassword;

      const user = new User();
      user.email = email;
      user.password = password;
      user.nickname = nickname;

      usersRepository.findOne.mockResolvedValue(user);

      const hashPassword = 'hashPassword';
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashPassword);

      user.password = hashPassword;
      usersRepository.save.mockResolvedValue(user);

      const result = await usersService.updateUser(email, updateUserDto);
      expect(result.password).toEqual(hashPassword);
      expect(result.nickname).toEqual(updateUserDto.nickname);
    });
  });
});
