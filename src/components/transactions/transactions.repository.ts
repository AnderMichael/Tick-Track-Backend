import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from 'src/config/prisma.client';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionPaginationDto } from './dto/transaction.pagination.dto';

@Injectable()
export class TransactionsRepository {
  private prisma: CustomPrismaClientType;
  constructor() {
    this.prisma = prisma;
  }

  async create(dto: CreateTransactionDto) {
    return this.prisma.transaction.create({
      data: dto,
    });
  }

  async findAll(pagination: TransactionPaginationDto) {
    const { page = 1, limit = 10 } = pagination;
    const skip = (page - 1) * limit;

    const where = pagination.buildTransactionWhere();

    const [data, total] = await Promise.all([
      this.prisma.transaction.findMany({
        where,
        include: {
          qualification: true,
          work: {
            include: {
              administrative: {
                include: {
                  user: true,
                },
              },
            },
          },
          inscription: {
            include: {
              commitment: {
                include: {
                  student: {
                    include: {
                      user: true,
                    },
                  },
                },
              },
            },
          },
          author: {
            include: {
              user: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prisma.transaction.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        qualification: true,
        work: {
          include: {
            administrative: {
              include: {
                user: true,
              },
            },
          },
        },
        inscription: {
          include: {
            commitment: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        author: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async softDelete(id: number) {
    return this.prisma.transaction.update({
      where: { id },
      data: { is_deleted: true },
    });
  }

  async findStudentHeader(upbCode: number) {
    return this.prisma.user.findFirst({
      where: {
        upbCode,
        student: { isNot: null },
      },
      select: {
        upbCode: true,
        firstName: true,
        fatherLastName: true,
        department_id: true,
      },
    });
  }

  async addStudentComment(id: number, comment: string) {
    return this.prisma.transaction.update({
      where: { id },
      data: {
        comment_student: {
          set: comment,
        },
      },
    });
  }

  async isAdmin(id: number) {
    const transaction = await this.prisma.role.findUnique({
      where: { id },
    });

    return transaction?.name === 'ADMIN';
  }

  async findTotalCompleteHoursByInscriptionId(
    inscriptionId: number,
  ): Promise<number> {
    const totalHours = await this.prisma.transaction.aggregate({
      _sum: {
        hours: true,
      },
      where: {
        inscription_id: inscriptionId,
        is_deleted: false,
      },
    });

    return totalHours._sum.hours || 0;
  }

  async markAsComplete(id: number) {
    return this.prisma.inscription.update({
      where: { id },
      data: { is_complete: true },
    });
  }

  async markAsIncomplete(id: number) {
    return this.prisma.inscription.update({
      where: { id },
      data: { is_complete: false },
    });
  }

  async findAdministrativeByUpbcode(adminUpbcode: number) {
    return this.prisma.administrative.findFirst({
      where: {
        user: {
          upbCode: adminUpbcode,
        },
      },
    });
  }

  async findInscriptionByUpbcodeAndSemester(
    upbCode: number,
    semester_id: number,
  ) {
    const inscription = await prisma.inscription.findFirst({
      where: {
        commitment: {
          student: {
            user: {
              upbCode,
            },
          },
        },
        semester_id,
      },
    });

    return inscription;
  }
}
