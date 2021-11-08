import { Body, Controller, HttpException, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async createUser(@Body() createBody: CreateUserDto) {
    const result = await this.usersService.createUser(createBody);
    if (result.ok) {
      return {
        message: '회원가입에 성공하였습니다.',
      };
    } else {
      throw new HttpException(result.error, result.htmlStatus);
    }
  }
}
