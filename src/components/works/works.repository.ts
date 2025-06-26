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

  async create(dto: CreateWorkDto, upbCode: number) {
    const administrative = await this.prisma.administrative.findFirst({
      where: {
        user: {
          upbCode,
        },
      },
    });

    return this.prisma.work.create({
      data: { ...dto, administrative_id: administrative!.id },
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
        orderBy: { created_at: 'desc' },
        include: {
          semester: true,
          administrative: {
            include: {
              user: true,
            },
          },
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
        administrative: {
          include: {
            user: true,
          },
        },
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

  async lock(id: number) {
    return this.prisma.work.update({
      where: { id },
      data: { is_open: false },
    });
  }

  async unlock(id: number) {
    return this.prisma.work.update({
      where: { id },
      data: { is_open: true },
    });
  }

  async countTransactions(id: number) {
    const count = await this.prisma.transaction.count({
      where: { work_id: id, is_deleted: false },
    });

    return count;
  }

  async createLog(status: string, workId: number, adminId: number) {
    return this.prisma.work_history.create({
      data: {
        status,
        work_id: workId,
        administrative_id: adminId,
        date: new Date(),
      },
    });
  }
}
