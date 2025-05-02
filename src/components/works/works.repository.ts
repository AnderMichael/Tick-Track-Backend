import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from '../../config/prisma.client';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkPaginationDto } from './dto/work.pagination.dto';

@Injectable()
export class WorksRepository {
  private prisma: CustomPrismaClientType;
  constructor() {
    this.prisma = prisma;
  }

  async create(dto: CreateWorkDto) {
    return this.prisma.work.create({
      data: dto,
    });
  }

  async findAll(pagination: WorkPaginationDto) {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where = pagination.buildWorkWhere();

    if (search) {
      where.title = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.work.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date_begin: 'desc' },
        include: {
          semester: true,
          administrative: true,
        },
      }),
      this.prisma.work.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.work.findUnique({
      where: { id },
      include: {
        semester: true,
        administrative: true,
      },
    });
  }

  async update(id: number, dto: UpdateWorkDto) {
    return this.prisma.work.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: number) {
    return this.prisma.work.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}
