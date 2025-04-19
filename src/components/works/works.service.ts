import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkModel } from './model/work.model';
import { WorksRepository } from './works.repository';

@Injectable()
export class WorksService {
  constructor(private readonly worksRepository: WorksRepository) { }

  async create(dto: CreateWorkDto) {
    const created = await this.worksRepository.create(dto);
    return new WorkModel(created);
  }

  async findAll(pagination: PaginationDto) {
    const result = await this.worksRepository.findAll(pagination);
    return {
      ...result,
      data: WorkModel.fromMany(result.data),
    };
  }

  async findOne(id: number) {
    const work = await this.worksRepository.findOne(id);
    if (!work || work.is_deleted) {
      throw new NotFoundException('Work not found');
    }
    return new WorkModel(work);
  }

  async update(id: number, dto: UpdateWorkDto) {
    const work = await this.findOne(id);
    const updated = await this.worksRepository.update(work.id, dto);
    return new WorkModel(updated);
  }

  async remove(id: number) {
    const work = await this.findOne(id);
    await this.worksRepository.softDelete(work.id);
    return { message: 'Work marked as deleted' };
  }
}
