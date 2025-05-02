import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { WorksService } from '../works/works.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionModel } from './models/transaction.model';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(private readonly transactionsRepository: TransactionsRepository, private readonly worksService: WorksService) { }

  async create(dto: CreateTransactionDto) {
    const work = await this.worksService.findOne(dto.work_id);
    const created = await this.transactionsRepository.create(dto);
    return new TransactionModel(created);
  }

  async findAll(pagination: PaginationDto) {
    const result = await this.transactionsRepository.findAll(pagination);
    return {
      ...result,
      data: TransactionModel.fromMany(result.data),
    };
  }

  async findOne(id: number) {
    const transaction = await this.transactionsRepository.findOne(id);
    if (!transaction || transaction.is_deleted) {
      throw new NotFoundException('Transaction not found');
    }
    return new TransactionModel(transaction);
  }

  async remove(id: number) {
    const transaction = await this.findOne(id);
    await this.transactionsRepository.softDelete(transaction.id);
    return { message: 'Transaction marked as deleted' };
  }
}
