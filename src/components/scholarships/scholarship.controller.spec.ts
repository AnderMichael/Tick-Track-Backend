import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { CreateServiceDetailsDto } from './dto/create-service-details.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { UpdateServiceDetailsDto } from './dto/update-service-details.dto';
import { ScholarshipsController } from './scholarships.controller';
import { ScholarshipsService } from './scholarships.service';

describe('ScholarshipsController', () => {
  let controller: ScholarshipsController;
  let service: jest.Mocked<ScholarshipsService>;

  const mockService: jest.Mocked<Partial<ScholarshipsService>> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    createServiceDetails: jest.fn(),
    findAllServiceDetails: jest.fn(),
    findServiceDetails: jest.fn(),
    updateServiceDetails: jest.fn(),
    removeServiceDetails: jest.fn(),
    associateScholarship: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScholarshipsController],
      providers: [{ provide: ScholarshipsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(UserAvailableGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ScholarshipsController>(ScholarshipsController);
    service = module.get(
      ScholarshipsService,
    ) as jest.Mocked<ScholarshipsService>;
  });

  it('create - should call service.create', async () => {
    const dto: CreateScholarshipDto = { name: 'Test Scholarship' } as any;
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll - should call service.findAll', async () => {
    const dto: PaginationDto = { page: 1, limit: 10 } as any;
    await controller.findAll(dto);
    expect(service.findAll).toHaveBeenCalledWith(dto);
  });

  it('findOne - should call service.findOne with number', async () => {
    await controller.findOne('42');
    expect(service.findOne).toHaveBeenCalledWith(42);
  });

  it('update - should call service.update with parsed ID and DTO', async () => {
    const dto: UpdateScholarshipDto = { name: 'Updated' } as any;
    await controller.update('1', dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
  });

  it('remove - should call service.remove with parsed ID', async () => {
    await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
  });

  it('createServiceDetails - should call service.createServiceDetails', async () => {
    const dto: CreateServiceDetailsDto = { hours_per_semester: 100 } as any;
    await controller.createServiceDetails('1', dto);
    expect(service.createServiceDetails).toHaveBeenCalledWith(1, dto);
  });

  it('findAllServiceDetails - should call service.findAllServiceDetails', async () => {
    await controller.findAllServiceDetails('2');
    expect(service.findAllServiceDetails).toHaveBeenCalledWith(2);
  });

  it('findServiceDetailsById - should call service.findServiceDetails with parsed ID', async () => {
    await controller.findServiceDetailsById('2', '5');
    expect(service.findServiceDetails).toHaveBeenCalledWith(5);
  });

  it('updateServiceDetails - should call service.updateServiceDetails', async () => {
    const dto: UpdateServiceDetailsDto = { hours_per_semester: 120 } as any;
    await controller.updateServiceDetails('2', '5', dto);
    expect(service.updateServiceDetails).toHaveBeenCalledWith(2, 5, dto);
  });

  it('removeServiceDetails - should call service.removeServiceDetails with parsed ID', async () => {
    await controller.removeServiceDetails('7');
    expect(service.removeServiceDetails).toHaveBeenCalledWith(7);
  });

  it('associateScholarship - should call service.associateScholarship with correct values', async () => {
    const dto = { percentage_id: 88 };
    await controller.associateScholarship('12345', dto);
    expect(service.associateScholarship).toHaveBeenCalledWith(12345, 88);
  });
});
