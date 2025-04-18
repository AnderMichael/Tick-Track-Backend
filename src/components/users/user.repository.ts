import { Injectable } from "@nestjs/common";
import { CustomPrismaClientType, prisma } from "src/config/prisma.client";

@Injectable()
export class UserRepository {
    private prisma: CustomPrismaClientType;

    constructor() {
        this.prisma = prisma
    }

    async findOneByUpbCode(upbCode: number) {
        return await this.prisma.user.findFirst({
            where: {
                upbCode: upbCode,
            },
        });
    }
}