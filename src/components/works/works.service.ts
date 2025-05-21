import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { SemestersService } from '../semesters/semesters.service';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkPaginationDto } from './dto/work.pagination.dto';
import { WorkModel } from './model/work.model';
import { WorksRepository } from './works.repository';

@Injectable()
export class WorksService {
  constructor(
    private readonly worksRepository: WorksRepository,
    private readonly semestersService: SemestersService,
  ) { }

  async create(dto: CreateWorkDto) {
    const semester = await this.semestersService.findOne(dto.semester_id);

    const startsWithinSemester =
      dto.date_begin >= semester.start_date &&
      dto.date_begin <= semester.end_date;
    const endsWithinSemester =
      dto.date_end >= semester.start_date && dto.date_end <= semester.end_date;

    if (!startsWithinSemester || !endsWithinSemester) {
      throw new BadRequestException(
        'Work dates must fall within the semester period',
      );
    }

    const created = await this.worksRepository.create(dto);
    return { message: `Work \"${created.title}\" created successfully` };
  }

  async findAll(pagination: WorkPaginationDto) {
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
    return { message: `Work \"${updated.title}\" created successfully` };
  }

  async remove(id: number) {
    const work = await this.findOne(id);
    await this.worksRepository.softDelete(work.id);
    return { message: 'Work marked as deleted' };
  }
}
