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
          work: {
            include: {
              administrative: {
                include: {
                  user: true
                }
              }
            }
          },
          commitment:
          {
            include: {
              student: {
                include: {
                  user: true
                }
              }
            }
          }
        },
        skip,
        take: limit,
        orderBy: { date: 'desc' },
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
        work: {
          include: {
            administrative: {
              include: {
                user: true
              }
            }
          }
        },
        commitment: {
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      }
    });
  }

  async softDelete(id: number) {
    return this.prisma.transaction.update({
      where: { id },
      data: { is_deleted: true },
    });
  }
}
