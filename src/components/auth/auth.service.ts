import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { BcryptUtils } from '../users/utils/bcrypt';
import { LoginDto } from './dto/login.dto';
import { UserInfo } from './models/UserInfo';
import { JWTUtils } from './utils/JWTUtils';
import { ConfirmDto } from './dto/confirm.dto';

@Injectable()
export class AuthService {
  private bcryptUtils: BcryptUtils;
  private jwtUtils: JWTUtils;

  constructor(private readonly userService: UserService) {
    this.bcryptUtils = new BcryptUtils();
    this.jwtUtils = new JWTUtils();
  }

  async obtainToken(loginDto: LoginDto) {
    const availability = await this.userService.checkAvailability(loginDto.upbCode);
    if (!availability) {
      throw new BadRequestException('User with UPB is not available, please contact to your local scholarship officer.');
    }

    try {
      const { upbCode, password } = loginDto;
      const user = await this.userService.findAuthorizationByUpbCode(upbCode);
      if (!user) {
        throw new Error('User Not Found');
      }

      const isPasswordValid = await this.bcryptUtils.comparePassword(password, user.hashed_password);
      if (!isPasswordValid) {
        throw new Error('Incorrect Password');
      }

      const token = this.jwtUtils.generateToken({
        department_id: user.department_id,
        role_id: user.role_id,
        upbCode: user.upbCode,
        permissions: user.role.role_permission.map((rolePermission) => rolePermission.permission.name),
      });

      return token;
    } catch (error) {
      throw new BadRequestException('Invalid credentials, check them again');
    }
  }

  async verifyToken(token: string) {
    try {
      const payload = this.jwtUtils.verifyToken(token);
      return payload as UserInfo;
    } catch (error) {
      throw new BadRequestException('Invalid session, please refresh it.');
    }
  }

  async getUserDetails(payload: UserInfo) {
    const user = await this.userService.getBasicUserInfo(payload);
    return user;
  }

  async checkAvaliability(upbCode: number) {
    const availabiity = await this.userService.checkAvailability(upbCode);
    return availabiity;
  }

  async confirmCredentials(upbCode: number, confirmDto: ConfirmDto){
    const {confirmPassword} = confirmDto;
    await this.userService.updatePassword(upbCode, confirmPassword);
    return {message: "Password updated successfully"};
  }
}
