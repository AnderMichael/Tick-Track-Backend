import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from 'src/config/prisma.client';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Injectable()
export class ScholarshipsRepository {
  private prisma: CustomPrismaClientType;
  constructor() {
    this.prisma = prisma;
  }

  async create(dto: CreateScholarshipDto) {
    return this.prisma.scholarship.create({ data: dto });
  }

  async findAll(pagination: PaginationDto) {
    const { page = 1, limit = 10, search } = pagination;
    const skip = (page - 1) * limit;

    const where: any = {
      is_deleted: false,
    };
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [data, total] = await Promise.all([
      this.prisma.scholarship.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.scholarship.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.scholarship.findUnique({ where: { id } });
  }

  async update(id: number, dto: UpdateScholarshipDto) {
    return this.prisma.scholarship.update({
      where: { id },
      data: dto,
    });
  }

  async softDelete(id: number) {
    return this.prisma.scholarship.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}
