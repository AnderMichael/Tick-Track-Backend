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
        student: {
          include: {
            commitment: {
              include: {
                inscriptions: {
                  include: {
                    semester: true,
                  },
                },
              },
            },
          },
        },
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

  async findCurrentCommitmentByUpbCode(upbCode: number) {
    return prisma.commitment.findFirst({
      where: {
        is_current: true,
        is_deleted: false,
        student: {
          user: {
            upbCode,
            is_deleted: false,
          },
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
        service_details: {
          include: {
            scholarship: true,
          },
        },
        inscriptions: true,
      },
    });
  }

  async findInscriptionByUpbcodeSemesterId(
    upbCode: number,
    semester_id: number,
  ) {
    return this.prisma.inscription.findFirst({
      where: {
        is_deleted: false,
        semester_id,
        commitment: {
          is_deleted: false,
          student: {
            user: {
              upbCode,
              is_deleted: false,
            },
          },
        },
      },
      include: {
        commitment: {
          include: {
            service_details: {
              include: {
                scholarship: true,
              },
            },
          },
        },
        semester: true,
      },
    });
  }

  async inscribeStudent(commitment_id: number, semester_id: number) {
    return this.prisma.inscription.create({
      data: {
        commitment_id,
        semester_id,
        created_at: new Date().toISOString(),
      },
      omit: {
        is_deleted: true,
        semester_id: true,
      },
      include: {
        semester: {
          omit: {
            is_deleted: true,
          },
        },
      },
    });
  }

  async findInscription(commitment_id: number, semester_id: number) {
    return await this.prisma.inscription.findFirst({
      where: {
        commitment_id,
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
        is_deleted: true,
      },
    });
  }

  async getTrackedHours(inscription_id: number): Promise<number> {
    const result = await this.prisma.transaction.aggregate({
      _sum: {
        hours: true,
      },
      where: {
        is_deleted: false,
        inscription_id,
      },
    });

    return result._sum.hours || 0;
  }

  async findCommitmentById(commitmentId: number) {
    return this.prisma.commitment.findFirst({
      where: { id: commitmentId, is_deleted: false },
      select: {
        id: true,
        student_id: true,
        is_current: true,
        service_details: {
          select: {
            percentage: true,
            hours_per_semester: true,
            scholarship: {
              select: {
                name: true,
                description: true,
              },
            },
          },
        },
      },
    });
  }
  async findUserByUpbCode(upbCode: number) {
    return this.prisma.user.findFirst({
      where: {
        upbCode,
        is_deleted: false,
      },
    });
  }

  async lock(upbCode: number) {
    const student = await this.findOne(upbCode);

    return this.prisma.user.update({
      where: { id: student?.id },
      data: { isAvailable: false },
      include: {
        student: true,
        role: true,
        department: true,
      },
    });
  }

  async unlock(upbCode: number) {
    const student = await this.findOne(upbCode);

    return this.prisma.user.update({
      where: { id: student?.id },
      data: { isAvailable: true },
      include: {
        student: true,
        role: true,
        department: true,
      },
    });
  }

  async findCommitmentsByUpbCode(upbCode: number) {
    return this.prisma.commitment.findMany({
      where: {
        is_deleted: false,
        student: {
          user: {
            upbCode,
            is_deleted: false,
          },
        },
      },
      include: {
        service_details: {
          include: {
            scholarship: true,
          },
        },
        inscriptions: {
          include: {
            semester: true,
          },
        },
      },
    });
  }

  async getInscriptionsByCommitmentAndYear(student_id: number, year: number) {
    const inscriptions = await this.prisma.inscription.findMany({
      where: {
        is_deleted: false,
        commitment: {
          student_id,
          is_deleted: false,
        },
        semester: {
          year,
          is_deleted: false,
        },
      },
      include: {
        semester: true,
        commitment: {
          include: {
            service_details: {
              include: {
                scholarship: true,
              },
            },
          },
        },
      },
    });
    return inscriptions;
  }

  async findInscriptionById(inscriptionId: number) {
    return this.prisma.inscription.findFirst({
      where: {
        id: inscriptionId,
        is_deleted: false,
      },
      include: {
        commitment: {
          include: {
            service_details: {
              include: {
                scholarship: true,
              },
            },
          },
        },
        semester: true,
      },
    });
  }

  async updateInscription(inscriptionId: number, commitment_id: number) {
    return this.prisma.inscription.update({
      where: { id: inscriptionId },
      data: { commitment_id },
      include: {
        commitment: {
          include: {
            service_details: {
              include: {
                scholarship: true,
              },
            },
          },
        },
        semester: true,
      },
    });
  }
}
