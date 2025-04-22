import { Injectable } from "@nestjs/common";
import { CustomPrismaClientType, prisma } from "../../config/prisma.client";
import { UserInfo } from "../auth/models/UserInfo";
import { BcryptUtils } from "./utils/bcrypt";

@Injectable()
export class UserRepository {
    private prisma: CustomPrismaClientType;
    private bcryptUtils: BcryptUtils;

    constructor() {
        this.prisma = prisma;
        this.bcryptUtils = new BcryptUtils();
    }

    async checkAvailability(upbCode: number) {
        const user = await this.prisma.user.findFirst({
            where: {
                upbCode: upbCode,
                isAvailable: true,
            },
        });
        return user ? true : false;
    }

    async findByUpbCode(upbCode: number) {
        return await this.prisma.user.findFirst({
            where: {
                upbCode: upbCode,
            },
            include: {
                role: {
                    include: {
                        role_permission: {
                            include: {
                                permission: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findUserDetails(payload: UserInfo) {
        const user = await this.prisma.user.findFirst({
            where: { upbCode: payload.upbCode },
            include: {
                role: true,
                department: true,
                students: {
                    include: {
                        commitment: {
                            include: {
                                service_details: {
                                    include: {
                                        scholarship: true,
                                    },
                                },
                            },
                        },
                        inscriptions: {
                            include: { semester: true },
                        },
                    },
                },
                administratives: true,
            },
        });
        return user;
    }

    async updatePassword(upbCode: number, password: string) {
        const user = await this.prisma.user.findFirst({
            where: { upbCode: upbCode },
        });


        const hashedPassword = await this.bcryptUtils.hashPassword(password);
        await this.prisma.user.update({
            where: { id: user?.id },
            data: { hashed_password: hashedPassword, is_confirmed: true },
        });
    }
}