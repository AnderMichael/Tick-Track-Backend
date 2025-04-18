import { BadRequestException, Injectable } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { BcryptUtils } from '../users/utils/bcrypt';
import { LoginDto } from './dto/login.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { JWTUtils } from './utils/JWTUtils';

@Injectable()
export class AuthService {
  private bcryptUtils: BcryptUtils;
  private jwtUtils: JWTUtils;

  constructor(private readonly userService: UserService) {
    this.bcryptUtils = new BcryptUtils();
    this.jwtUtils = new JWTUtils();
  }

  async obtainToken(loginDto: LoginDto) {
    try {
      const { upbCode, password } = loginDto;
      const user = await this.userService.findOneByUpbCode(upbCode);
      if (!user) {
        throw new Error('User not found');
      }
      const isPasswordValid = await this.bcryptUtils.comparePassword(password, user.hashed_password);
      if (!isPasswordValid) {
        throw new Error('Incorrect password');
      }

      const token = this.jwtUtils.generateToken({
        department_id: user.department_id,
        role_id: user.role_id,
        upbCode: user.upbCode,
        permissions: user.role.role_permission.map((rolePermission) => rolePermission.permission.name),
      });

      return token;
    } catch (error) {
      throw new BadRequestException('Invalid credentials');
    }
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
