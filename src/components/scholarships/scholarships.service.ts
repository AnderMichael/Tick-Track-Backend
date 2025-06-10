import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { CreateServiceDetailsDto } from './dto/create-service-details.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { UpdateServiceDetailsDto } from './dto/update-service-details.dto';
import { ScholarshipModel } from './model/scholarship.model';
import { ScholarshipsRepository } from './scholarships.repository';

@Injectable()
export class ScholarshipsService {
  constructor(
    private readonly scholarshipsRepository: ScholarshipsRepository,
  ) {}

  async create(dto: CreateScholarshipDto) {
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

  async createServiceDetails(
    scholarshipId: number,
    serviceDetails: CreateServiceDetailsDto,
  ) {
    const scholarship = await this.findOne(scholarshipId);
    const availableServiceDetails = await this.findAllServiceDetails(
      scholarship.id,
    );
    availableServiceDetails.forEach((detail) => {
      if (detail.percentage === serviceDetails.percentage) {
        throw new ConflictException(
          `Service details with percentage ${serviceDetails.percentage} already exists for this scholarship`,
        );
      }
    });

    await this.scholarshipsRepository.createServiceDetails(
      scholarshipId,
      serviceDetails,
    );

    return {
      message: 'Service details created, percentage added successfully',
    };
  }

  async findAllServiceDetails(scholarshipId: number) {
    const scholarship = await this.findOne(scholarshipId);
    const serviceDetails =
      await this.scholarshipsRepository.findAllServiceDetails(scholarship.id);
    return serviceDetails;
  }

  async findServiceDetails(serviceDetailsId: number) {
    const serviceDetails =
      await this.scholarshipsRepository.findServiceDetails(serviceDetailsId);
    if (!serviceDetails) {
      throw new NotFoundException('Service details not found');
    }
    return serviceDetails;
  }

  async updateServiceDetails(
    serviceDetailsId: number,
    serviceDetails: UpdateServiceDetailsDto,
  ) {
    const existing = await this.findServiceDetails(serviceDetailsId);
    await this.scholarshipsRepository.updateServiceDetails(
      existing.id,
      serviceDetails,
    );
    return { message: 'Service details updated successfully' };
  }

  async removeServiceDetails(serviceDetailsId: number) {
    const existing = await this.findServiceDetails(serviceDetailsId);
    await this.scholarshipsRepository.softDeleteServiceDetails(existing.id);
    return { message: 'Service details marked as deleted' };
  }
}
