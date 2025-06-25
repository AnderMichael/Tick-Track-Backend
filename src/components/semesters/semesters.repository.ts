import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from '../../config/prisma.client';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { SemesterPaginationDto } from './dto/pagination.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';

@Injectable()
export class SemestersRepository {
  private prisma: CustomPrismaClientType;
  constructor() {
    this.prisma = prisma;
  }

  async create(createDto: CreateSemesterDto) {
    return this.prisma.semester.create({
      data: createDto,
    });
  }

  async findAll(pagination: SemesterPaginationDto) {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where = pagination.buildSemesterWhere();

    const [data, total] = await Promise.all([
      this.prisma.semester.findMany({
        where,
        skip,
        take: limit,
        orderBy: { start_date: 'desc' },
      }),
      this.prisma.semester.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.semester.findUnique({
      where: { id },
    });
  }

  async update(id: number, updateDto: UpdateSemesterDto) {
    return this.prisma.semester.update({
      where: { id },
      data: updateDto,
    });
  }

  async softDelete(id: number) {
    return this.prisma.semester.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  async findOverlapping(start: string, end: string, excludeId?: number) {
    return this.prisma.semester.findMany({
      where: {
        is_deleted: false,
        start_date: { lte: end },
        end_date: { gte: start },
        ...(excludeId ? { NOT: { id: excludeId } } : []),
      },
    });
  }

  async countInscriptions(semesterId: number) {
    return this.prisma.inscription.count({
      where: { semester_id: semesterId, is_deleted: false },
    });
  }

  async countWorks(semesterId: number) {
    return this.prisma.work.count({
      where: { semester_id: semesterId, is_deleted: false },
    });
  }
}
