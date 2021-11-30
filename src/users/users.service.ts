import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { USER_CONSTANTS, USER_ERROR_MSG } from './user.constants';

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
    const existUser = await this.findOne(email);
    if (existUser) {
      throw new ConflictException(USER_ERROR_MSG.EXISTED_EMAIL);
    }

    const user = this.usersRepository.create({ email, password, nickname });
    try {
      const result = await this.usersRepository.save(user);
      delete result.password;
      return result;
    } catch (error) {
      throw new InternalServerErrorException(
        USER_ERROR_MSG.CREATE_INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(email: string): Promise<User> {
    return await this.usersRepository.findOne({ email });
  }

  // 로그인 시각 갱신
  async updateLoginedAt(email: string, loginedAt: Date): Promise<void> {
    const user = await this.findOne(email);
    user.loginedAt = loginedAt;
    await this.usersRepository.save(user);
  }

  async updateUser(email: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(email);
    const { nickname, password } = updateUserDto;
    user.nickname = nickname || user.nickname;
    user.password = password
      ? await bcrypt.hash(password, USER_CONSTANTS.SALT_ROUND)
      : user.password;

    try {
      return await this.usersRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(
        USER_ERROR_MSG.UPDATE_INTERNAL_SERVER_ERROR,
      );
    }
  }
}
