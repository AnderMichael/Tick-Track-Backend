import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentModel } from './models/student.model';
import { StudentsRepository } from './students.repository';

@Injectable()
export class StudentsService {
  constructor(private readonly repository: StudentsRepository) { }

  create(dto: CreateStudentDto) {
    return this.repository.create(dto);
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

  update(upbCode: number, dto: UpdateStudentDto) {
    return this.repository.update(upbCode, dto);
  }

  remove(upbCode: number) {
    return this.repository.softDelete(upbCode);
  }
}
