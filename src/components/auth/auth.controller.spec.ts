import { ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfirmDto } from './dto/confirm.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserAvailableGuard } from './guards/user-availability.guard';

const mockUser = { id: 1, upbCode: 123 };

const mockRequest = {
  user: mockUser,
};

const mockAuthService = {
  obtainToken: jest.fn(),
  getUserDetails: jest.fn(),
  confirmCredentials: jest.fn(),
  resetCredentials: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: (ctx: ExecutionContext) => true })
      .overrideGuard(UserAvailableGuard)
      .useValue({ canActivate: (ctx: ExecutionContext) => true })
      .compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('should return token and refresh token on valid login', async () => {
      const dto: LoginDto = { upbCode: 45679, password: '123456' };
      const response = { token: 'mocked-token', currentRefreshToken: 'refresh-token' };
      mockAuthService.obtainToken.mockResolvedValue(response);

      const result = await controller.login(dto);

      expect(mockAuthService.obtainToken).toHaveBeenCalledWith(dto);
      expect(result).toEqual(response);
    });
  });

  describe('getCurrentUser', () => {
    it('should return user details', async () => {
      mockAuthService.getUserDetails.mockResolvedValue(mockUser);

      const result = await controller.getCurrentUser(mockRequest as any);

      expect(mockAuthService.getUserDetails).toHaveBeenCalledWith(mockUser);
      expect(result).toEqual(mockUser);
    });
  });

  describe('confirmUser', () => {
    it('should confirm user credentials', async () => {
      const confirmDto: ConfirmDto = {
        password: '123456',
        confirmPassword: '123456',
      };
      mockAuthService.confirmCredentials.mockResolvedValue({
        message: 'Password updated successfully',
      });

      const result = await controller.confirmUser(
        mockRequest as any,
        confirmDto,
      );

      expect(mockAuthService.confirmCredentials).toHaveBeenCalledWith(
        mockUser.upbCode,
        confirmDto,
      );
      expect(result).toEqual({ message: 'Password updated successfully' });
    });
  });

  describe('resetPassword', () => {
    it('should reset password for given upbCode', async () => {
      mockAuthService.resetCredentials.mockResolvedValue({
        message: 'Password reset successfully',
      });

      const result = await controller.resetPassword(mockRequest as any, 123);

      expect(mockAuthService.resetCredentials).toHaveBeenCalledWith(
        mockUser,
        123,
      );
      expect(result).toEqual({ message: 'Password reset successfully' });
    });
  });
});
