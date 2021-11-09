import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async createUser({
    email,
    password,
    nickname,
  }: CreateUserDto): Promise<User> {
    const existUser = this.usersRepository.findOne({ email });
    if (existUser) {
      throw new ConflictException('이미 가입된 이메일입니다.');
    }

    const user = this.usersRepository.create({ email, password, nickname });
    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        '회원 가입에 오류가 발생하였습니다.',
      );
    }
  }

  async findOne(email: string): Promise<User> {
    return await this.usersRepository.findOne({ email });
  }

  // 로그인한 유저 시각 갱신
  async updateLoginedAt(email: string, loginedAt: Date): Promise<void> {
    const user = await this.findOne(email);
    user.loginedAt = loginedAt;
    await this.usersRepository.save(user);
  }
}
