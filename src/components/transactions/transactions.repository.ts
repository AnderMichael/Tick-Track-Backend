import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from 'src/config/prisma.client';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class TransactionsRepository {
    private prisma: CustomPrismaClientType;
    constructor() {
        this.prisma = prisma;
    }

    async create(dto: CreateTransactionDto) {
        return this.prisma.transactions.create({
            data: dto,
        });
    }

    async findAll(pagination: PaginationDto) {
        const { page = 1, limit = 10 } = pagination;
        const skip = (page - 1) * limit;

        const where = { is_deleted: false };

        const [data, total] = await Promise.all([
            this.prisma.transactions.findMany({
                where,
                skip,
                take: limit,
                orderBy: { date: 'desc' },
            }),
            this.prisma.transactions.count({ where }),
        ]);

        return {
            data,
            total,
            page,
            lastPage: Math.ceil(total / limit),
        };
    }

    async findOne(id: number) {
        return this.prisma.transactions.findUnique({
            where: { id },
        });
    }

    async softDelete(id: number) {
        return this.prisma.transactions.update({
            where: { id },
            data: { is_deleted: true },
        });
    }
}