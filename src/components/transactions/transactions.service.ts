import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StudentsService } from '../students/students.service';
import { WorksService } from '../works/works.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionPaginationDto } from './dto/transaction.pagination.dto';
import { TransactionModel } from './models/transaction.model';
import { TransactionsRepository } from './transactions.repository';

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
    private readonly worksService: WorksService,
    private readonly studentsService: StudentsService,
  ) { }

  async create(dto: CreateTransactionDto) {
    const work = await this.worksService.findOne(dto.work_id);
    
    if (!work) {
      throw new NotFoundException('Work not found');
    }

    const inscription = await this.studentsService.findInscription(dto.commitment_id, work.semester_id);

    if(!inscription) {
      throw new NotFoundException('Student is not inscribed in this semester');
    }

    const created = await this.transactionsRepository.create(dto);
    return { message: `Succesful Payment! Transaction N° ${created.id} to work \"${work.title}\"` };
  }

  async findAll(pagination: TransactionPaginationDto) {
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

  async getStudentHeaderInfo(upbCode: number, department_id: number) {
    const commitment = await this.studentsService.findCurrentCommitmentByUpbCode(upbCode);
    if (!commitment) {
      throw new NotFoundException('Commitment not found');
    }
    const student = await this.transactionsRepository.findStudentHeader(upbCode);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    if (student.department_id !== department_id) {
      throw new BadRequestException('Interdepartment transaction is not allowed');
    }

    return {
      ...student,
      commitment_id: commitment.id,
    }
  }
}
