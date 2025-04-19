import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from 'src/config/prisma.client';
import { AdministrativePaginationDto } from '../common/dto/user.pagination.dto';
import { BcryptUtils } from '../users/utils/bcrypt';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';

@Injectable()
export class AdministrativeRepository {
    private prisma: CustomPrismaClientType;
    private bcryptUtils: BcryptUtils;

    constructor() {
        this.prisma = prisma;
        this.bcryptUtils = new BcryptUtils();
    }

    async create(dto: CreateAdministrativeDto) {
        const { upbRole, ...userData } = dto;
        const defaultHashedPassword = await this.bcryptUtils.getDefaultPassword();

        return this.prisma.user.create({
            data: {
                ...userData,
                hashed_password: defaultHashedPassword,
                administratives: {
                    create: { upbRole },
                },
            },
            include: {
                administratives: true,
                role: true,
                department: true,
            },
        });
    }

    async findAll(pagination: AdministrativePaginationDto) {
        const { page = 1, limit = 10, search } = pagination;
        const skip = (page - 1) * limit;

        const where = pagination.buildWhere();

        const [data, total] = await Promise.all([
            this.prisma.user.findMany({
                where,
                include: {
                    administratives: true,
                    role: true,
                    department: true,
                },
                skip,
                take: limit,
            }),
            this.prisma.user.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async findOne(upbCode: number) {
        return this.prisma.user.findFirst({
            where: {
                administratives: {
                    isNot: null,
                },
                upbCode,
            },
            include: {
                administratives: true,
                role: true,
                department: true,
            },
        });
    }

    async update(upbCode: number, dto: UpdateAdministrativeDto) {
        const { upbRole, ...userData } = dto;
        const admin = await this.findOne(upbCode);

        await this.prisma.administratives.update({
            where: { id: admin?.id },
            data: { upbRole },
        });

        return this.prisma.user.update({
            where: { id: admin?.id },
            data: { ...userData },
            include: {
                administratives: true,
                role: true,
                department: true,
            },
        });
    }

    async softDelete(upbCode: number) {
        const admin = await this.findOne(upbCode);

        await this.prisma.administratives.update({
            where: { id: admin?.id },
            data: { is_deleted: true },
        });

        await this.prisma.user.update({
            where: { id: admin?.id },
            data: { is_deleted: true },
        });

        return { message: 'Administrative marked as deleted' };
    }

    async findRole(role: string) {
        return this.prisma.role.findFirst({
            where: { name: role },
        });
    }
}