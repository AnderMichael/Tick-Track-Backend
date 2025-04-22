import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { AuthenticatedRequest } from "./jwt-auth.guard";

@Injectable()
export class UserAvailableGuard implements CanActivate {

    constructor(private readonly authService: AuthService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
        const user = request.user;

        const isAvailable = await this.authService.checkAvaliability(user.upbCode);
        if (!isAvailable) {
            throw new BadRequestException(`User with UPB is not available, please contact to your local scholarship officer.`);
        }

        return true;
    }
}