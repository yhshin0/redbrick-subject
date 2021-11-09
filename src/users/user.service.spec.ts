import { ConflictException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

const mockUserRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
});

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: MockRepository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockUserRepository() },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get<MockRepository<User>>(getRepositoryToken(User));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createUser', () => {
    it('유저 생성 성공', async () => {
      const createUser: CreateUserDto = {
        email: 'test@g.com',
        password: '123',
        nickname: 'zz',
      };
      userRepository.findOne.mockResolvedValue(undefined);
      const existUser = await service.findOne(createUser.email);
      expect(existUser).toBeUndefined();
      userRepository.save.mockResolvedValue(createUser);
      const result = await service.createUser(createUser);
      delete createUser.password;
      expect(result).toBe(createUser);
    });

    it('이미 존재하는 이메일', async () => {
      const createUser = {
        email: 'test5@g.com',
        password: '123',
        nickname: 'zz',
      };
      userRepository.findOne.mockResolvedValue({
        ...createUser,
        loginedAt: new Date(),
        hashPassword: undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        projects: null,
        games: null,
      });

      try {
        const result = await service.createUser(createUser);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('이미 가입된 이메일입니다.');
      }
    });
  });
});
