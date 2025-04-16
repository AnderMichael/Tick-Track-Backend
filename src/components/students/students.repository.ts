import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from 'src/config/prisma.client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { BcryptUtils } from '../users/utils/bcrypt';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsRepository {
    private prisma: CustomPrismaClientType;
    private bcryptUtils: BcryptUtils;

    constructor() {
        this.prisma = prisma;
        this.bcryptUtils = new BcryptUtils();
    }

    async create(createDto: CreateStudentDto) {
        const { semester, ...userData } = createDto;
        const defaultHashedPassword = await this.bcryptUtils.getDefaultPassword();

        return this.prisma.user.create({
            data: {
                ...userData,
                hashed_password: defaultHashedPassword,
                students: {
                    create: { semester },
                },
            },
            include: {
                students: true,
                role: true,
                department: true,
            },
        });
    }

    async findAll(pagination: PaginationDto) {
        const { page = 1, limit = 10, search } = pagination;
        const skip = (page - 1) * limit;

        const where = {
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
                    students: true,
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
        const student = await this.prisma.user.findUnique({
            where: { upbCode },
            include: {
                students: true,
                role: true,
                department: true,
            },
        });
        return student;
    }

    async update(upbCode: number, updateDto: UpdateStudentDto) {
        const { semester, ...userData } = updateDto;
        const student = await this.findOne(upbCode);

        await this.prisma.students.update({
            where: { id: student?.id },
            data: { semester },
        });

        return this.prisma.user.update({
            where: { upbCode },
            data: { ...userData },
            include: {
                students: true,
                role: true,
                department: true,
            },
        });
    }

    async softDelete(upbCode: number) {
        const student = await this.findOne(upbCode);

        await this.prisma.students.update({
            where: { id: student?.id },
            data: { is_deleted: true },
        });

        await this.prisma.user.update({
            where: { upbCode },
            data: { is_deleted: true },
        });

        return { message: 'Student marked as deleted' };
    }
}
