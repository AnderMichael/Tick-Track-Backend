import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { JWTUtils } from '../../users/utils/JWTUtils';
import { AuthenticatedRequest } from './jwt-auth.guard';

export interface AccountStudentRequest extends AuthenticatedRequest {
    student: {
        upbCode: number;
    };
}

@Injectable()
export class AccountKeyGuard implements CanActivate {
    private JWTAccountKeyUtils = new JWTUtils();
    constructor() { }

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const token = request.body?.account_key;

        if (!token) {
            throw new UnauthorizedException('Missing account token');
        }

        try {
            const payload = await this.JWTAccountKeyUtils.verifyAccountKeyToken(token);

            request.student = {
                upbCode: payload.upbCode,
            };

            return true;
        } catch (err) {
            throw new BadRequestException('Invalid account processing');
        }
    }
}
