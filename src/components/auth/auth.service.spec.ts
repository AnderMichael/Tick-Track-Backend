import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { BcryptUtils } from '../users/utils/bcrypt';
import { AuthService } from './auth.service';
import { ConfirmDto } from './dto/confirm.dto';
import { LoginDto } from './dto/login.dto';
import { JWTUtils } from './utils/JWTUtils';

jest.mock('../users/utils/bcrypt');
jest.mock('./utils/JWTUtils');

const mockUserService = {
  checkAvailability: jest.fn(),
  findAuthorizationByUpbCode: jest.fn(),
  getBasicUserInfo: jest.fn(),
  confirmPassword: jest.fn(),
  resetPassword: jest.fn(),
  getRefreshToken: jest.fn(),
  addRefreshToken: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;
  let bcryptUtils: BcryptUtils;
  let jwtUtils: JWTUtils;

  beforeEach(() => {
    bcryptUtils = new BcryptUtils();
    jwtUtils = new JWTUtils();
    service = new AuthService(mockUserService as any);
    (service as any).bcryptUtils = bcryptUtils;
    (service as any).jwtUtils = jwtUtils;
  });

  it('should obtain token and refresh token with valid credentials', async () => {
    const loginDto: LoginDto = { upbCode: 1, password: 'secret' };
    mockUserService.checkAvailability.mockResolvedValue(true);
    mockUserService.findAuthorizationByUpbCode.mockResolvedValue({
      id: 1,
      hashed_password: 'hashed',
      role_id: 2,
      department_id: 3,
      upbCode: 1,
      role: { role_permission: [{ permission: { name: 'view:users' } }] },
    });
    mockUserService.getRefreshToken.mockResolvedValue(null);
    mockUserService.addRefreshToken.mockResolvedValue(undefined);
    bcryptUtils.comparePassword = jest.fn().mockResolvedValue(true);
    jwtUtils.generateToken = jest.fn().mockReturnValue('token123');
    jwtUtils.generateRefreshToken = jest.fn().mockReturnValue(['refresh123', 999999]);

    const result = await service.obtainToken(loginDto);
    expect(result).toEqual({ token: 'token123', currentRefreshToken: 'refresh123' });
  });

  it('should return existing refresh token if already present', async () => {
    const loginDto: LoginDto = { upbCode: 1, password: 'secret' };
    mockUserService.checkAvailability.mockResolvedValue(true);
    mockUserService.findAuthorizationByUpbCode.mockResolvedValue({
      id: 1,
      hashed_password: 'hashed',
      role_id: 2,
      department_id: 3,
      upbCode: 1,
      role: { role_permission: [{ permission: { name: 'view:users' } }] },
    });
    mockUserService.getRefreshToken.mockResolvedValue('existingRefresh');
    bcryptUtils.comparePassword = jest.fn().mockResolvedValue(true);
    jwtUtils.generateToken = jest.fn().mockReturnValue('token123');

    const result = await service.obtainToken(loginDto);
    expect(result).toEqual({ token: 'token123', currentRefreshToken: 'existingRefresh' });
  });

  it('should throw BadRequest if credentials invalid', async () => {
    const loginDto: LoginDto = { upbCode: 1, password: 'wrong' };
    mockUserService.checkAvailability.mockResolvedValue(true);
    mockUserService.findAuthorizationByUpbCode.mockResolvedValue({
      hashed_password: 'hashed',
    });
    bcryptUtils.comparePassword = jest.fn().mockResolvedValue(false);

    await expect(service.obtainToken(loginDto)).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequest if user not available', async () => {
    const loginDto: LoginDto = { upbCode: 1, password: 'secret' };
    mockUserService.checkAvailability.mockResolvedValue(false);
    await expect(service.obtainToken(loginDto)).rejects.toThrow(BadRequestException);
  });

  it('should verify valid token', async () => {
    const payload = { id: 1 };
    jwtUtils.verifyToken = jest.fn().mockReturnValue(payload);
    const result = await service.verifyToken('valid.token');
    expect(result).toEqual(payload);
  });

  it('should throw UnauthorizedException if token invalid', async () => {
    jwtUtils.verifyToken = jest.fn(() => {
      throw new Error('invalid');
    });
    await expect(service.verifyToken('invalid')).rejects.toThrow(UnauthorizedException);
  });

  it('should get user details', async () => {
    mockUserService.getBasicUserInfo.mockResolvedValue({ id: 1 });
    const result = await service.getUserDetails({ id: 1 } as any);
    expect(result).toEqual({ id: 1 });
  });

  it('should confirm credentials', async () => {
    const confirmDto: ConfirmDto = {
      password: '1234',
      confirmPassword: '1234',
    };
    mockUserService.confirmPassword.mockResolvedValue(undefined);
    const result = await service.confirmCredentials(1, confirmDto);
    expect(result).toEqual({ message: 'Password updated successfully' });
  });

  it('should reset credentials if permission is valid', async () => {
    const user = { role: { name: 'student' } };
    mockUserService.findAuthorizationByUpbCode.mockResolvedValue(user);
    mockUserService.resetPassword.mockResolvedValue(undefined);
    const result = await service.resetCredentials(
      { permissions: ['update:students'] } as any,
      1,
    );
    expect(result).toEqual({ message: 'Password reset successfully' });
  });

  it('should throw if no permission to reset', async () => {
    const user = { role: { name: 'student' } };
    mockUserService.findAuthorizationByUpbCode.mockResolvedValue(user);
    await expect(
      service.resetCredentials({ permissions: ['update:officers'] } as any, 1),
    ).rejects.toThrow(UnauthorizedException);
  });
});
