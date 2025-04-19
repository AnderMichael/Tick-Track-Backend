import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { AuthService } from '../auth.service';

interface AuthenticatedRequest extends Request {
    user?: any;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) return false;

        const token = authHeader.split(' ')[1];

        try {
            const payload = await this.authService.verifyToken(token);
            request.user = {
                upbCode: payload.upbCode,
                department_id: payload.department_id,
                role_id: payload.role_id,
                permissions: payload.permissions || [],
            };
            return true;
        } catch (error) {
            return false;
        }
    }
}
