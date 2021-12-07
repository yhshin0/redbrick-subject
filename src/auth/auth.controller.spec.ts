import { Test, TestingModule } from '@nestjs/testing';

import { User } from '../users/entities/user.entity';
import { AUTH_CONSTANTS } from './auth.constants';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

jest.mock('./auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect.assertions(2);
    expect(authController).toBeDefined();
    expect(authService).toBeDefined();
  });

  it('signin에 성공한다', async () => {
    const email = 'testuser@asdf.com';
    const password = 'password';
    const loginUserDto = new LoginUserDto();
    loginUserDto.email = email;
    loginUserDto.password = password;
    const accessToken = 'TOKEN';
    jest.spyOn(authService, 'signIn').mockResolvedValue({ accessToken });
    const result = await authController.signIn(loginUserDto);
    expect(result).toMatchObject({ accessToken });
  });

  it('signout에 성공한다', async () => {
    const user = new User();
    jest.spyOn(authService, 'signOut').mockResolvedValue(undefined);
    const msg = { message: AUTH_CONSTANTS.LOGOUT_MSG };
    const result = await authController.logout(user);
    expect(result).toMatchObject(msg);
  });
});
