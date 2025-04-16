import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentModel } from './models/student.model';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(private readonly repository: StudentsRepository) { }

  async create(dto: CreateStudentDto) {
    const { upbCode } = dto;
    const student = await this.repository.findOne(upbCode);

    if (student) {
      throw new BadRequestException('Student already exists');
    }
    
    const newStudent = this.repository.create(dto); 
    return new StudentModel(newStudent);
  }

  async findAll(pagination: PaginationDto) {
    const result = await this.repository.findAll(pagination);
    return {
      ...result,
      data: StudentModel.fromMany(result.data),
    };
  }

  async findOne(upbCode: number) {
    const user = await this.repository.findOne(upbCode);
    return new StudentModel(user);
  }

  async update(upbCode: number, dto: UpdateStudentDto) {
    const student = await this.repository.findOne(upbCode);

    if (!student) {
      throw new NotFoundException('Student not exists');
    }
    const updatedStudent = this.repository.update(upbCode, dto);
    return new StudentModel(updatedStudent);
  }

  async remove(upbCode: number) {
    const student = await this.repository.findOne(upbCode);

    if (!student) {
      throw new NotFoundException('Student not exists');
    }

    const deletedStudent = this.repository.softDelete(upbCode); 
    return new StudentModel(deletedStudent);
  }
}
