import { Injectable, NotAcceptableException } from '@nestjs/common';
import { UserInfo } from '../auth/models/UserInfo';
import { UserModel } from './models/user.model';
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAuthorizationByUpbCode(upbCode: number) {
    const user = await this.userRepository.findByUpbCode(upbCode);
    return user;
  }

  async getBasicUserInfo(payload: UserInfo) {
    const user = await this.userRepository.findUserDetails(payload);
    return new UserModel(user);
  }

  async checkAvailability(upbCode: number) {
    const isAvailable = await this.userRepository.checkAvailability(upbCode);
    return isAvailable;
  }

  async confirmPassword(upbCode: number, password: string) {
    const user = await this.userRepository.findByUpbCode(upbCode);
    if (user?.is_confirmed)
      throw new NotAcceptableException(
        'User already confirmed, please contact your local scholarship officer to reset your password.',
      );
    await this.userRepository.updatePassword(upbCode, password);
  }

  async resetPassword(upbCode: number) {
    await this.userRepository.resetPassword(upbCode);
  }
}
