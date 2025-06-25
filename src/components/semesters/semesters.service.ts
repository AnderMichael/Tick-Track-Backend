import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SemestersRepository } from './semesters.repository';

import { CreateSemesterDto } from './dto/create-semester.dto';
import { SemesterPaginationDto } from './dto/pagination.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { SemesterModel } from './models/semester.model';

@Injectable()
export class SemestersService {
  constructor(private readonly semestersRepository: SemestersRepository) { }

  async create(dto: CreateSemesterDto) {
    const overlap = await this.semestersRepository.findOverlapping(
      dto.start_date,
      dto.end_date,
    );
    if (overlap.length > 0) {
      throw new BadRequestException(
        'Semester dates overlap with an existing semester',
      );
    }

    const newSemester = await this.semestersRepository.create(dto);
    return new SemesterModel(newSemester);
  }

  async findAll(pagination: SemesterPaginationDto) {
    const result = await this.semestersRepository.findAll(pagination);
    return {
      ...result,
      data: SemesterModel.fromMany(result.data),
    };
  }

  async findOne(id: number) {
    const semester = await this.semestersRepository.findOne(id);
    if (!semester || semester.is_deleted) {
      throw new NotFoundException('Semester not found');
    }
    return new SemesterModel(semester);
  }

  async update(id: number, dto: UpdateSemesterDto) {
    const semester = await this.findOne(id);

    const overlap = await this.semestersRepository.findOverlapping(
      dto.start_date ?? semester.start_date,
      dto.end_date ?? semester.end_date,
      semester.id,
    );
    if (overlap.length > 0) {
      throw new BadRequestException(
        'Semester dates overlap with an existing semester',
      );
    }

    const updated = await this.semestersRepository.update(semester.id, dto);
    return new SemesterModel(updated);
  }

  async remove(id: number) {
    const semester = await this.findOne(id);
    const inscriptions = await this.semestersRepository.countInscriptions(semester.id);

    if (inscriptions > 0) {
      throw new BadRequestException(
        'Cannot delete semester with existing inscriptions',
      );
    }

    await this.semestersRepository.softDelete(semester.id);
    return { message: 'Semester marked as deleted' };
  }
}
