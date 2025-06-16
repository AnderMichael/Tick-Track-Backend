import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from '../../config/prisma.client';
import { AdministrativePaginationDto } from '../common/dto/user.pagination.dto';
import { BcryptUtils } from '../users/utils/bcrypt';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { TrackSummaryDto } from './dto/track-summary.dto';
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
    const { upbRole: upb_role, ...userData } = dto;
    const defaultHashedPassword = await this.bcryptUtils.getDefaultPassword();

    return this.prisma.user.create({
      data: {
        ...userData,
        hashed_password: defaultHashedPassword,
        administrative: {
          create: {
            upb_role,
          },
        },
      },
      include: {
        administrative: true,
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
          administrative: true,
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
        administrative: {
          isNot: null,
        },
        upbCode,
      },
      include: {
        administrative: true,
        role: true,
        department: true,
      },
    });
  }

  async update(upbCode: number, dto: UpdateAdministrativeDto) {
    const { upbRole: upb_role, ...userData } = dto;
    const admin = await this.findOne(upbCode);

    await this.prisma.administrative.update({
      where: { id: admin?.id },
      data: { upb_role },
    });

    return this.prisma.user.update({
      where: { id: admin?.id },
      data: { ...userData },
      include: {
        administrative: true,
        role: true,
        department: true,
      },
    });
  }

  async softDelete(upbCode: number) {
    const admin = await this.findOne(upbCode);

    await this.prisma.administrative.update({
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

  async getWorkSummary(tracksSummaryDto: TrackSummaryDto, semesterId: number) {
    const { upbCode, department_id } = tracksSummaryDto;

    const filters: any = {
      semester_id: semesterId,
      is_deleted: false,
    };

    if (upbCode) {
      const user = await this.prisma.user.findFirst({
        where: { upbCode, is_deleted: false },
        select: { id: true },
      });
      if (user) {
        filters.administrative_id = user.id;
      }
    }

    if (department_id) {
      filters.administrative = {
        user: {
          department_id,
        },
      };
    }

    const [open, closed, total] = await Promise.all([
      this.prisma.work.count({
        where: {
          ...filters,
          is_open: true,
        },
      }),
      this.prisma.work.count({
        where: {
          ...filters,
          is_open: false,
        },
      }),
      this.prisma.work.count({
        where: filters,
      }),
    ]);

    return { open, closed, total };
  }
}
