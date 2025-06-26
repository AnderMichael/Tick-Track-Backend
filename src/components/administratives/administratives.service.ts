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

  async create(dto: CreateAdministrativeDto, administrative_id: number) {
    const { upbCode } = dto;
    const admin = await this.administrativeRepository.findOne(upbCode);

    if (admin) {
      throw new BadRequestException('Administrative already exists');
    }
    const newAdmin = await this.administrativeRepository.create(dto);
    await this.administrativeRepository.addLog(
      'created',
      newAdmin.id,
      administrative_id,
    );
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

    if (!admin || admin.is_deleted) {
      throw new NotFoundException('Administrative not exists');
    }

    return new AdministrativeModel(admin);
  }

  async update(
    upbCode: number,
    dto: UpdateAdministrativeDto,
    administrative_id: number,
  ) {
    const admin = await this.findOne(upbCode);

    const updated = await this.administrativeRepository.update(
      admin.upbCode,
      dto,
    );

    await this.administrativeRepository.addLog(
      'updated',
      updated.id,
      administrative_id,
    );

    return new AdministrativeModel(updated);
  }

  async remove(upbCode: number, administrative_id: number) {
    const admin = await this.findOne(upbCode);
    const worksCount =
      await this.administrativeRepository.countWorksByAdministrative(admin.id);

    if (worksCount > 0) {
      throw new BadRequestException(
        'Cannot delete administrative with existing works',
      );
    }

    const transactionsCount =
      await this.administrativeRepository.countTransactionsByAdministrative(
        admin.id,
      );

    if (transactionsCount > 0) {
      throw new BadRequestException(
        'Cannot delete administrative with existing transactions',
      );
    }

    const removed = await this.administrativeRepository.softDelete(
      admin.upbCode,
    );

    await this.administrativeRepository.addLog(
      'deleted',
      admin.id,
      administrative_id,
    );

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

  async findAllDepartments() {
    const departments =
      await this.administrativeRepository.findAllDepartments();
    if (!departments || departments.length === 0) {
      throw new NotFoundException('No departments found');
    }
    return departments.map((department) => ({
      id: department.id,
      value: department.name,
    }));
  }

  async lock(upbCode: number, administrative_id: number) {
    const admin = await this.administrativeRepository.findOne(upbCode);
    if (!admin) {
      throw new NotFoundException('Administrative not exists');
    }

    const updated = await this.administrativeRepository.lock(upbCode);
    await this.administrativeRepository.addLog(
      'locked',
      updated.id,
      administrative_id,
    );
    return new AdministrativeModel(updated);
  }

  async unlock(upbCode: number, administrative_id: number) {
    const admin = await this.administrativeRepository.findOne(upbCode);
    if (!admin) {
      throw new NotFoundException('Administrative not exists');
    }

    const updated = await this.administrativeRepository.unlock(upbCode);
    await this.administrativeRepository.addLog(
      'unlocked',
      updated.id,
      administrative_id,
    );
    return new AdministrativeModel(updated);
  }
}
