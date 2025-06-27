import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { AdministrativePaginationDto } from '../common/dto/user.pagination.dto';
import { AdministrativesController } from './administratives.controller';
import { AdministrativesService } from './administratives.service';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { TrackSummaryDto } from './dto/track-summary.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';

describe('AdministrativesController', () => {
  let controller: AdministrativesController;
  let service: jest.Mocked<AdministrativesService>;

  const mockService: Partial<Record<keyof AdministrativesService, jest.Mock>> =
    {
      create: jest.fn(),
      findByRole: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      lock: jest.fn(),
      unlock: jest.fn(),
      getWorkSummary: jest.fn(),
      findAllDepartments: jest.fn(),
    };

  const mockRequest = { user: { id: 1 } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministrativesController],
      providers: [{ provide: AdministrativesService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(UserAvailableGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<AdministrativesController>(
      AdministrativesController,
    );
    service = module.get(
      AdministrativesService,
    ) as jest.Mocked<AdministrativesService>;
  });

  it('should create scholarship officer', async () => {
    const dto = {} as CreateAdministrativeDto;
    await controller.createScholarshipOfficer(dto, mockRequest);
    expect(service.create).toHaveBeenCalledWith(dto, mockRequest.user.id);
  });

  it('should find all scholarship officers', async () => {
    const dto = {} as AdministrativePaginationDto;
    await controller.findAllScholarshipOfficers(dto);
    expect(service.findByRole).toHaveBeenCalledWith('SCHOLARSHIP_OFFICER', dto);
  });

  it('should find one scholarship officer', async () => {
    await controller.findOneScholarshipOfficer('123');
    expect(service.findOne).toHaveBeenCalledWith(123);
  });

  it('should update scholarship officer', async () => {
    const dto = {} as UpdateAdministrativeDto;
    await controller.updateScholarshipOfficer('123', dto, mockRequest);
    expect(service.update).toHaveBeenCalledWith(123, dto, mockRequest.user.id);
  });

  it('should delete scholarship officer', async () => {
    await controller.removeScholarshipOfficer('123', mockRequest);
    expect(service.remove).toHaveBeenCalledWith(123, mockRequest.user.id);
  });

  it('should create supervisor', async () => {
    const dto = {} as CreateAdministrativeDto;
    await controller.createSupervisor(dto, mockRequest);
    expect(service.create).toHaveBeenCalledWith(dto, mockRequest.user.id);
  });

  it('should find all supervisors', async () => {
    const dto = {} as AdministrativePaginationDto;
    await controller.findAllSupervisors(dto);
    expect(service.findByRole).toHaveBeenCalledWith('SUPERVISOR', dto);
  });

  it('should find one supervisor', async () => {
    await controller.findOneSupervisor('456');
    expect(service.findOne).toHaveBeenCalledWith(456);
  });

  it('should update supervisor', async () => {
    const dto = {} as UpdateAdministrativeDto;
    await controller.updateSupervisor('456', dto, mockRequest);
    expect(service.update).toHaveBeenCalledWith(456, dto, mockRequest.user.id);
  });

  it('should lock and unlock supervisor', async () => {
    await controller.lockSupervisor('456', mockRequest);
    expect(service.lock).toHaveBeenCalledWith(456, mockRequest.user.id);

    await controller.unlockSupervisor('456', mockRequest);
    expect(service.unlock).toHaveBeenCalledWith(456, mockRequest.user.id);
  });

  it('should delete supervisor', async () => {
    await controller.removeSupervisor('456', mockRequest);
    expect(service.remove).toHaveBeenCalledWith(456, mockRequest.user.id);
  });

  it('should lock and unlock scholarship officer', async () => {
    await controller.lockScholarshipOfficer('789', mockRequest);
    expect(service.lock).toHaveBeenCalledWith(789, mockRequest.user.id);

    await controller.unlockScholarshipOfficer('789', mockRequest);
    expect(service.unlock).toHaveBeenCalledWith(789, mockRequest.user.id);
  });

  it('should get tracking info', async () => {
    const dto = {} as TrackSummaryDto;
    await controller.getTrackingInfo(2, dto);
    expect(service.getWorkSummary).toHaveBeenCalledWith(dto, 2);
  });

  it('should get departments', async () => {
    await controller.findAllDepartments();
    expect(service.findAllDepartments).toHaveBeenCalled();
  });
});
