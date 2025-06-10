import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from '../../config/prisma.client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { CreateServiceDetailsDto } from './dto/create-service-details.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { UpdateServiceDetailsDto } from './dto/update-service-details.dto';

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

  async createServiceDetails(
    scholarshipId: number,
    serviceDetails: CreateServiceDetailsDto,
  ) {
    return this.prisma.service_details.create({
      data: {
        scholarship_id: scholarshipId,
        ...serviceDetails,
      },
    });
  }

  async findAllServiceDetails(scholarshipId: number) {
    return this.prisma.service_details.findMany({
      where: { scholarship_id: scholarshipId, is_deleted: false },
      orderBy: { percentage: 'asc' },
    });
  }

  async findServiceDetails(serviceDetailsId: number) {
    return this.prisma.service_details.findUnique({
      where: { id: serviceDetailsId, is_deleted: false },
    });
  }

  async updateServiceDetails(
    serviceDetailsId: number,
    serviceDetails: UpdateServiceDetailsDto,
  ) {
    return this.prisma.service_details.update({
      where: { id: serviceDetailsId },
      data: serviceDetails,
    });
  }

  async softDeleteServiceDetails(serviceDetailsId: number) {
    return this.prisma.service_details.update({
      where: { id: serviceDetailsId },
      data: { is_deleted: true },
    });
  }
}
