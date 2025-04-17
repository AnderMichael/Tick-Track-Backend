import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { prisma } from 'src/config/prisma.client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { BcryptUtils } from '../users/utils/bcrypt';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';

@Injectable()
export class AdministrativeRepository {
    private prisma: PrismaClient;
    private bcryptUtils: BcryptUtils;

    constructor() {
        this.prisma = prisma;
    }

    async create(createDto: CreateAdministrativeDto) {
        const { upbRole, ...userData } = createDto;
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

    async findAll(pagination: PaginationDto) {
        const { page = 1, limit = 10, search } = pagination;
        const skip = (page - 1) * limit;

        const where = {
            is_deleted: false,
            administratives: {
                is_deleted: false,
            },
            ...(search && {
                upbCode: {
                    equals: parseInt(search),
                },
            }),
        };

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
        const admin = await this.prisma.user.findUnique({
            where: { upbCode },
            include: {
                administratives: true,
                role: true,
                department: true,
            },
        });

        if (!admin || admin.is_deleted || admin.administratives?.is_deleted) {
            throw new NotFoundException(`Administrative with upbCode ${upbCode} not found`);
        }

        return admin;
    }

    async update(upbCode: number, updateDto: UpdateAdministrativeDto) {
        const { upbRole, ...userData } = updateDto;
        const admin = await this.findOne(upbCode);

        await this.prisma.administratives.update({
            where: { id: admin.id },
            data: { upbRole },
        });

        return this.prisma.user.update({
            where: { upbCode },
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
            where: { id: admin.id },
            data: { is_deleted: true },
        });

        await this.prisma.user.update({
            where: { upbCode },
            data: { is_deleted: true },
        });

        return { message: 'Administrative marked as deleted' };
    }
}
