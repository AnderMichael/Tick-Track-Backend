import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdministrativePaginationDto } from '../common/dto/user.pagination.dto';
import { AdministrativeRepository } from './administratives.repository';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { TrackSummaryDto } from './dto/track-summary.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';
import { AdministrativeModel } from './models/administratives.model';

@Injectable()
export class AdministrativesService {
  constructor(
    private readonly administrativeRepository: AdministrativeRepository,
  ) {}

  async create(dto: CreateAdministrativeDto) {
    const { upbCode } = dto;
    const admin = await this.administrativeRepository.findOne(upbCode);

    if (admin) {
      throw new BadRequestException('Administrative already exists');
    }

    const newAdmin = await this.administrativeRepository.create(dto);
    return new AdministrativeModel(newAdmin);
  }

  async findAll(pagination: AdministrativePaginationDto) {
    const result = await this.administrativeRepository.findAll(pagination);
    return {
      ...result,
      data: AdministrativeModel.fromMany(result.data),
    };
  }

  async findOne(upbCode: number) {
    const admin = await this.administrativeRepository.findOne(upbCode);

    if (!admin) {
      throw new NotFoundException('Administrative not exists');
    }

    return new AdministrativeModel(admin);
  }

  async update(upbCode: number, dto: UpdateAdministrativeDto) {
    const admin = await this.administrativeRepository.findOne(upbCode);

    if (!admin) {
      throw new NotFoundException('Administrative not exists');
    }

    const updated = await this.administrativeRepository.update(upbCode, dto);
    return new AdministrativeModel(updated);
  }

  async remove(upbCode: number) {
    const admin = await this.administrativeRepository.findOne(upbCode);

    if (!admin) {
      throw new NotFoundException('Administrative not exists');
    }

    const removed = await this.administrativeRepository.softDelete(upbCode);
    return removed;
  }

  async findByRole(roleName: string, pagination: AdministrativePaginationDto) {
    const role = await this.administrativeRepository.findRole(roleName);
    if (!role) throw new NotFoundException('Role not Found');

    pagination.role_id = role.id;

    const result = await this.administrativeRepository.findAll(pagination);
    return {
      ...result,
      data: AdministrativeModel.fromMany(result.data),
    };
  }

  async getWorkSummary(tracksSummaryDto: TrackSummaryDto, semesterId: number) {
    const summary = await this.administrativeRepository.getWorkSummary(
      tracksSummaryDto,
      semesterId,
    );
    return {
      open: summary.open,
      closed: summary.closed,
      total: summary.total,
    };
  }
}
