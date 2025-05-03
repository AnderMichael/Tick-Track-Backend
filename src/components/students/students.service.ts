import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StudentPaginationDto } from '../common/dto/user.pagination.dto';
import { SemestersService } from '../semesters/semesters.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentModel } from './models/student.model';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository, private readonly semestersService: SemestersService) { }

  async create(dto: CreateStudentDto) {
    const { upbCode } = dto;
    const student = await this.studentsRepository.findOne(upbCode);

    if (student) {
      throw new BadRequestException('Student already exists');
    }

    const newStudent = await this.studentsRepository.create(dto);
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

  async update(upbCode: number, dto: UpdateStudentDto) {
    const student = await this.studentsRepository.findOne(upbCode);

    if (!student) {
      throw new NotFoundException('Student not exists');
    }

    const updatedStudent = await this.studentsRepository.update(upbCode, dto);
    return new StudentModel(updatedStudent);
  }

  async remove(upbCode: number) {
    const student = await this.studentsRepository.findOne(upbCode);

    if (!student) {
      throw new NotFoundException('Student not exists');
    }

    const deletedStudent = await this.studentsRepository.softDelete(upbCode);
    return new StudentModel(deletedStudent);
  }

  async inscribeStudent(upbCode: number, semester_id: number) {
    const commitment = await this.findCurrentCommitmentByUpbCode(upbCode);
    const semester = await this.semestersService.findOne(semester_id);

    const inscription = await this.studentsRepository.findInscription(commitment.id, semester.id);
    if (inscription) {
      throw new BadRequestException('Student already inscribed');
    }

    return this.studentsRepository.inscribeStudent(commitment.id, semester.id);
  }

  async findCurrentCommitmentByUpbCode(upbCode: number) {
    const commitment = await this.studentsRepository.findCurrentCommitmentByUpbCode(upbCode);
    if (!commitment) {
      throw new NotFoundException('Commitment not exists');
    }
    return commitment;
  }

  async findInscription(commitment_id: number, semester_id: number) {
    const inscription = await this.studentsRepository.findInscription(commitment_id, semester_id);
    return inscription;
  }

  async removeInscription(upbCode: number, semester_id: number) {
    const user = await this.findOne(upbCode);
    const semester = await this.semestersService.findOne(semester_id);
    const inscription = await this.findInscription(user.student?.commitment.id, semester.id);
    if (!inscription) {
      throw new NotFoundException('Inscription not exists');
    }
    return this.studentsRepository.uninscribeStudent(inscription.id);
  }
}
