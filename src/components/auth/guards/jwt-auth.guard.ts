import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';
import { UserInfo } from '../models/UserInfo';

export interface AuthenticatedRequest extends Request {
  user: UserInfo;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

    const token = authHeader.split(' ')[1];

    const payload = await this.authService.verifyToken(token);
    request.user = {
      upbCode: payload.upbCode,
      department_id: payload.department_id,
      role_id: payload.role_id,
      permissions: payload.permissions || [],
    };

    return true;
  }
}
