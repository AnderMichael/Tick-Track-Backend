import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
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
  ) {}

  async create(dto: CreateTransactionDto) {
    const work = await this.worksService.findOne(dto.work_id);

    if (!work) {
      throw new NotFoundException('Work not found');
    }

    const inscription = await this.studentsService.findInscription(
      dto.commitment_id,
      work.semester_id,
    );

    if (!inscription) {
      throw new NotFoundException('Student is not inscribed in this semester');
    }

    const author =
      await this.transactionsRepository.findAdministrativeByUpbcode(
        dto.author_id,
      );

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    dto.author_id = author.id;
    const created = await this.transactionsRepository.create(dto);

    const totalHours =
      await this.transactionsRepository.findTotalCompleteHoursByInscriptionId(
        inscription.id,
      );
    const commitment = await this.studentsService.findCommitmentById(
      inscription.commitment_id,
    );

    if (
      totalHours >= commitment.service_details.hours_per_semester &&
      !inscription.is_complete
    ) {
      await this.transactionsRepository.markAsComplete(inscription.id);
    }

    return {
      message: `Succesful Payment! Transaction N° ${created.id} to work \"${work.title}\"`,
    };
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

    const semester_id = transaction.work.semester_id;
    const inscription = await this.studentsService.findInscription(
      transaction.commitment_id,
      semester_id,
    );

    const totalHours =
      await this.transactionsRepository.findTotalCompleteHoursByInscriptionId(
        inscription.id,
      );
    const commitment = await this.studentsService.findCommitmentById(
      inscription.commitment_id,
    );

    if (
      totalHours < commitment.service_details.hours_per_semester &&
      inscription.is_complete
    ) {
      await this.transactionsRepository.markAsIncomplete(inscription.id);
    }

    return { message: 'Transaction marked as deleted' };
  }

  async getStudentHeaderInfo(
    upbCode: number,
    department_id: number,
    administrative_role_id: number,
    semester_id: number,
  ) {
    const commitment =
      await this.transactionsRepository.findCommitmentByUpbcodeAndSemester(
        upbCode,
        semester_id,
      );
    if (!commitment) {
      throw new NotFoundException('Commitment not found');
    }
    const student =
      await this.transactionsRepository.findStudentHeader(upbCode);
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const isAdmin = await this.transactionsRepository.isAdmin(
      administrative_role_id,
    );

    if (!isAdmin) {
      if (student.department_id !== department_id) {
        throw new BadRequestException(
          'Interdepartment transaction is not allowed',
        );
      }
    }

    return {
      ...student,
      commitment_id: commitment.id,
    };
  }

  async addStudentComment(
    id: number,
    student_comment: string,
    studentUpbCode: number,
  ) {
    const transaction = await this.findOne(id);
    if (transaction.student_upbCode !== studentUpbCode) {
      throw new UnauthorizedException(
        'You are not authorized to comment on this transaction',
      );
    }
    if (!student_comment || student_comment.trim() === '') {
      throw new BadRequestException('Comment cannot be empty');
    }
    if (transaction.comment_student) {
      throw new BadRequestException(
        'Comment already exists for this transaction',
      );
    }
    await this.transactionsRepository.addStudentComment(
      transaction.id,
      student_comment,
    );
    return {
      message: 'Comment added successfully',
    };
  }
}
