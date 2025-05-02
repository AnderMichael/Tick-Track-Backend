import { Module } from '@nestjs/common';
import { UserRepository } from '../users/user.repository';
import { UserService } from '../users/user.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  controllers: [AuthController],
  providers: [AuthService, UserService, UserRepository],
  exports: [AuthService],
})
export class AuthModule {}
