import { Injectable } from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { AdministrativeRepository } from './administratives.repository';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';
import { AdministrativeModel } from './models/administratives.model';

@Injectable()
export class AdministrativesService {
  constructor(private readonly repository: AdministrativeRepository) { }

  create(dto: CreateAdministrativeDto) {
    return this.repository.create(dto);
  }

  async findAll(pagination: PaginationDto) {
    const result = await this.repository.findAll(pagination);
    return {
      ...result,
      data: AdministrativeModel.fromMany(result.data),
    };
  }

  async findOne(upbCode: number) {
    const user = await this.repository.findOne(upbCode);
    return new AdministrativeModel(user);
  }

  update(upbCode: number, dto: UpdateAdministrativeDto) {
    return this.repository.update(upbCode, dto);
  }

  remove(upbCode: number) {
    return this.repository.softDelete(upbCode);
  }
}
