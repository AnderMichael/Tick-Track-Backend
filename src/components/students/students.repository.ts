import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from '../../config/prisma.client';
import { StudentPaginationDto } from '../common/dto/user.pagination.dto';
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

  async create(dto: CreateStudentDto) {
    const { semester, ...userData } = dto;
    const defaultHashedPassword = await this.bcryptUtils.getDefaultPassword();

    return this.prisma.user.create({
      data: {
        ...userData,
        hashed_password: defaultHashedPassword,
        student: {
          create: { semester },
        },
      },
      include: {
        student: true,
        role: true,
        department: true,
      },
    });
  }

  async findAll(pagination: StudentPaginationDto) {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where = pagination.buildWhere();

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        include: {
          student: true,
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
        student: {
          isNot: null,
        },
        upbCode,
      },
      include: {
        student: true,
        role: true,
        department: true,
      },
    });
  }

  async update(upbCode: number, dto: UpdateStudentDto) {
    const { semester, ...userData } = dto;
    const student = await this.findOne(upbCode);

    await this.prisma.student.update({
      where: { id: student?.id },
      data: { semester },
    });

    return this.prisma.user.update({
      where: { id: student?.id },
      data: { ...userData },
      include: {
        student: true,
        role: true,
        department: true,
      },
    });
  }

  async softDelete(upbCode: number) {
    const student = await this.findOne(upbCode);

    await this.prisma.student.update({
      where: { id: student?.id },
      data: { is_deleted: true },
    });

    await this.prisma.user.update({
      where: { id: student?.id },
      data: { is_deleted: true },
    });

    return { message: 'Student marked as deleted' };
  }

  async inscribeStudent(student_id: number, semester_id: number) {
    return this.prisma.inscription.create({
      data: {
        student_id,
        semester_id,
        created_at: new Date().toISOString(),
      },
    });
  }

  async findInscription(student_id: number, semester_id: number) {
    return this.prisma.inscription.findFirst({
      where: {
        student_id,
        semester_id,
      },
    });
  }

  async uninscribeStudent(inscription_id: number) {
    return this.prisma.inscription.update({
      where: {
        id: inscription_id,
      },
      data: {
        is_deleted: true
      }
    });
  }
}
