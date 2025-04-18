import { Injectable, NotFoundException } from "@nestjs/common";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {

    constructor(private readonly userRepository: UserRepository) { }

    async findOneByUpbCode(upbCode: number) {
        const user = await this.userRepository.findOneByUpbCode(upbCode);
        if (!user) {
            throw new NotFoundException(`User with UPB code ${upbCode} not found`);
        }
        return user;
    }
}