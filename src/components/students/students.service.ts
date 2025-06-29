import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentPaginationDto } from '../common/dto/user.pagination.dto';
import { SemesterModel } from '../semesters/models/semester.model';
import { SemestersService } from '../semesters/semesters.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentModel } from './models/student.model';
import { StudentsRepository } from './students.repository';
import { TransactionsRepository } from '../transactions/transactions.repository';

@Injectable()
export class StudentsService {
  constructor(
    private readonly studentsRepository: StudentsRepository,
    private readonly semestersService: SemestersService,
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async create(dto: CreateStudentDto, administrative_id: number) {
    const { upbCode } = dto;

    const existingUser =
      await this.studentsRepository.findUserByUpbCode(upbCode);

    if (existingUser) {
      throw new BadRequestException('User already exists with this UPB code');
    }

    const student = await this.studentsRepository.findOne(upbCode);

    if (student) {
      throw new BadRequestException('Student already exists');
    }

    const newStudent = await this.studentsRepository.create(dto);
    await this.studentsRepository.addLog(
      'created',
      newStudent.id,
      administrative_id,
    );
    return new StudentModel(newStudent);
  }

  async findAll(pagination: StudentPaginationDto) {
    const result = await this.studentsRepository.findAll(pagination);
    return {
      ...result,
      data: StudentModel.fromMany(result.data),
    };
  }

  async findOne(upbCode: number) {
    const student = await this.studentsRepository.findOne(upbCode);

    if (!student) {
      throw new NotFoundException('Student not exists');
    }

    return new StudentModel(student);
  }

  async update(upbCode: number, dto: UpdateStudentDto, administrative_id: number) {
    const student = await this.findOne(upbCode);

    const updated = await this.studentsRepository.update(student.upbCode, dto);

    await this.studentsRepository.addLog(
      'updated',
      updated.id,
      administrative_id,
    );
  }

  async remove(upbCode: number, administrative_id: number) {
    const student = await this.findOne(upbCode);

    const countCommitments =
      await this.studentsRepository.countCommitmentsByStudentId(student.id);

    if (countCommitments > 0) {
      throw new BadRequestException(
        'Cannot delete student with existing commitments',
      );
    }

    await this.studentsRepository.softDelete(upbCode);
    await this.studentsRepository.addLog(
      'deleted',
      student.id,
      administrative_id,
    );
  }

  async inscribeStudent(
    upbCode: number,
    semester_id: number,
    commitmentId: number,
  ) {
    const commitment = await this.findCommitmentById(commitmentId);
    const semester = await this.semestersService.findOne(semester_id);

    const inscription = await this.studentsRepository.findInscription(
      commitment.id,
      semester.id,
    );
    if (inscription) {
      throw new BadRequestException('Student already inscribed');
    }

    return this.studentsRepository.inscribeStudent(commitment.id, semester.id);
  }

  async findCurrentCommitmentByUpbCode(upbCode: number) {
    const commitment =
      await this.studentsRepository.findCurrentCommitmentByUpbCode(upbCode);
    if (!commitment) {
      throw new NotFoundException('Commitment not exists');
    }
    return commitment;
  }

  async findInscription(commitment_id: number, semester_id: number) {
    const inscription = await this.studentsRepository.findInscription(
      commitment_id,
      semester_id,
    );

    if (!inscription) {
      throw new NotFoundException('Inscription not exists');
    }

    return inscription;
  }

  async removeInscription(
    upbCode: number,
    semester_id: number,
    commitment_id: number,
  ) {
    const semester = await this.semestersService.findOne(semester_id);
    const commitment = await this.findCommitmentById(commitment_id);
    const inscription = await this.findInscription(commitment.id, semester.id);

    if (!inscription) {
      throw new NotFoundException('Inscription not exists');
    }

    const transactions =
      await this.studentsRepository.countTransactionsByInscriptionId(
        inscription.id,
      );

    if (transactions > 0) {
      throw new BadRequestException(
        'Cannot uninscribe student with existing transactions',
      );
    }

    return await this.studentsRepository.uninscribeStudent(inscription.id);
  }

  async getTrackingBySemester(upbCode: number, semesterId: number) {
    const inscription =
      await this.studentsRepository.findInscriptionByUpbcodeSemesterId(
        upbCode,
        semesterId,
      );

    if (!inscription) {
      throw new NotFoundException('Student is not enrolled in this semester');
    }

    const tracked = await this.studentsRepository.getTrackedHours(
      inscription.id,
    );

    return {
      total: inscription.commitment.service_details.hours_per_semester,
      completed: tracked,
      remaining: Math.max(
        inscription.commitment.service_details.hours_per_semester - tracked,
        0,
      ),
    };
  }

  async findCommitmentById(commitmentId: number) {
    const commitment =
      await this.studentsRepository.findCommitmentById(commitmentId);
    if (!commitment) {
      throw new NotFoundException('Commitment not found');
    }
    return commitment;
  }

  async lock(upbCode: number, administrative_id: number) {
    const student = await this.studentsRepository.findOne(upbCode);
    if (!student) {
      throw new NotFoundException('Student not exists');
    }

    await this.studentsRepository.lock(upbCode);
    await this.studentsRepository.addLog(
      'locked',
      student.id,
      administrative_id,
    );
  }

  async unlock(upbCode: number, administrative_id: number) {
    const student = await this.studentsRepository.findOne(upbCode);
    if (!student) {
      throw new NotFoundException('Student not exists');
    }
    await this.studentsRepository.unlock(upbCode);
    await this.studentsRepository.addLog(
      'unlocked',
      student.id,
      administrative_id,
    );
  }

  async findStudentCommitments(upbCode: number) {
    const student = await this.findOne(upbCode);

    const commitments = await this.studentsRepository.findCommitmentsByUpbCode(
      student.upbCode,
    );

    return commitments.map((commitment) => ({
      id: commitment.id,
      isCurrent: commitment.is_current,
      scholarship: commitment.service_details.scholarship.name,
      percentage: commitment.service_details.percentage,
      hoursPerSemester: commitment.service_details.hours_per_semester,
    }));
  }

  async getInscriptions(upbCode: number, year: number) {
    const student = await this.findOne(upbCode);

    const inscriptions =
      await this.studentsRepository.getInscriptionsByCommitmentAndYear(
        student.id,
        year,
      );

    return inscriptions.map((inscription) => ({
      id: inscription.id,
      semester: new SemesterModel(inscription.semester),
      scholarship: inscription.commitment.service_details.scholarship.name,
      percentage: inscription.commitment.service_details.percentage,
      commitmentId: inscription.commitment_id,
      createdAt: inscription.created_at,
      is_complete: inscription.is_complete,
    }));
  }

  async updateInscription(
    upbCode: number,
    inscriptionId: number,
    commitment_id: number,
  ) {
    await this.findOne(upbCode);
    const inscription =
      await this.studentsRepository.findInscriptionById(inscriptionId);

    if (!inscription) {
      throw new NotFoundException('Inscription not found');
    }

    const totalHours =
      await this.transactionsRepository.findTotalCompleteHoursByInscriptionId(
        inscription.id,
      );


    const commitment = await this.findCommitmentById(commitment_id);


    if (
      totalHours > commitment.service_details.hours_per_semester &&
      !inscription.is_complete
    ) {
      this.transactionsRepository.markAsComplete(inscription.id);
    }

    if (
      totalHours < commitment.service_details.hours_per_semester &&
      inscription.is_complete
    ) {
      this.transactionsRepository.markAsIncomplete(inscription.id);
    }

    await this.studentsRepository.updateInscription(
      inscription.id,
      commitment_id,
    );
  }

  async findInscriptionById(inscriptionId: number) {
    const inscription =
      await this.studentsRepository.findInscriptionById(inscriptionId);

    if (!inscription) {
      throw new NotFoundException('Inscription not found');
    }

    return {
      id: inscription.id,
      semester: new SemesterModel(inscription.semester),
      scholarship: inscription.commitment.service_details.scholarship.name,
      percentage: inscription.commitment.service_details.percentage,
      commitmentId: inscription.commitment_id,
      createdAt: inscription.created_at,
      is_complete: inscription.is_complete,
    };
  }
}
