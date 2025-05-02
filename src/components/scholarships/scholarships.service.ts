import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ScholarshipsRepository } from './scholarships.repository';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { ScholarshipModel } from './model/scholarship.model';

@Injectable()
export class ScholarshipsService {
  constructor(
    private readonly scholarshipsRepository: ScholarshipsRepository,
  ) {}

  async create(dto: CreateScholarshipDto) {
    // const existing = await this.scholarshipsRepository.findAll({ search: dto.name });
    // if (existing.total > 0) {
    //   throw new BadRequestException('Scholarship already exists');
    // }
    const created = await this.scholarshipsRepository.create(dto);
    return new ScholarshipModel(created);
  }

  async findAll(pagination: PaginationDto) {
    const result = await this.scholarshipsRepository.findAll(pagination);
    return {
      ...result,
      data: ScholarshipModel.fromMany(result.data),
    };
  }

  async findOne(id: number) {
    const scholarship = await this.scholarshipsRepository.findOne(id);
    if (!scholarship || scholarship.is_deleted) {
      throw new NotFoundException('Scholarship not found');
    }
    return new ScholarshipModel(scholarship);
  }

  async update(id: number, dto: UpdateScholarshipDto) {
    const existing = await this.findOne(id);
    const updated = await this.scholarshipsRepository.update(existing.id, dto);
    return new ScholarshipModel(updated);
  }

  async remove(id: number) {
    const existing = await this.findOne(id);
    await this.scholarshipsRepository.softDelete(existing.id);
    return { message: 'Scholarship marked as deleted' };
  }
}
