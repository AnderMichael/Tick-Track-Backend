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
  ) {}

  async create(dto: CreateWorkDto, upbCode: number) {
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

    const created = await this.worksRepository.create(dto, upbCode);
    await this.worksRepository.createLog(
      'created',
      created.id,
      created.administrative_id,
    );
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

  async update(id: number, dto: UpdateWorkDto, administrative_id: number) {
    const work = await this.findOne(id);
    const semester = await this.semestersService.findOne(work.semester_id);

    let startsWithinSemester = true;
    let endsWithinSemester = true;

    if (dto.date_begin) {
      startsWithinSemester =
        dto.date_begin >= semester.start_date &&
        dto.date_begin <= semester.end_date;
    }

    if (dto.date_end) {
      endsWithinSemester =
        dto.date_end >= semester.start_date &&
        dto.date_end <= semester.end_date;
    }

    if (!startsWithinSemester || !endsWithinSemester) {
      throw new BadRequestException(
        'Work dates must fall within the semester period',
      );
    }
    const updated = await this.worksRepository.update(work.id, dto);

    await this.worksRepository.createLog(
      'updated',
      updated.id,
      administrative_id,
    );
    return { message: `Work \"${updated.title}\" created successfully` };
  }

  async remove(id: number, administrative_id: number) {
    const work = await this.findOne(id);

    const count = await this.worksRepository.countTransactions(work.id);

    if (count > 0) {
      throw new BadRequestException(
        'Cannot delete work with existing transactions',
      );
    }

    const deleted = await this.worksRepository.softDelete(work.id);
    await this.worksRepository.createLog(
      'deleted',
      deleted.id,
      administrative_id,
    );
    return { message: 'Work marked as deleted' };
  }

  async lock(id: number, administrative_id: number) {
    const work = await this.findOne(id);
    if (!work.is_open) {
      throw new BadRequestException('Work is already locked');
    }
    const updated = await this.worksRepository.lock(work.id);
    await this.worksRepository.createLog(
      'locked',
      updated.id,
      administrative_id,
    );
    return { message: `Work \"${updated.title}\" locked successfully` };
  }

  async unlock(id: number, administrative_id: number) {
    const work = await this.findOne(id);
    if (work.is_open) {
      throw new BadRequestException('Work is already unlocked');
    }
    const updated = await this.worksRepository.unlock(work.id);
    await this.worksRepository.createLog(
      'unlocked',
      updated.id,
      administrative_id,
    );
    return { message: `Work \"${updated.title}\" unlocked successfully` };
  }
}
