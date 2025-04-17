import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { StudentPaginationDto } from '../common/dto/user.pagination.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentModel } from './models/student.model';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(private readonly studentsRepository: StudentsRepository) { }

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
}
