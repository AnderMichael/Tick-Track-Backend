import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { SemestersController } from './semesters.controller';
import { SemestersService } from './semesters.service';

describe('SemestersController', () => {
  let controller: SemestersController;
  let service: jest.Mocked<SemestersService>;

  const mockSemester = {
    id: 1,
    name: 'Sem 1',
    number: 1,
    year: 2024,
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    is_deleted: false,
  };

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SemestersController],
      providers: [
        {
          provide: SemestersService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(UserAvailableGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<SemestersController>(SemestersController);
    service = module.get(SemestersService);
    jest.clearAllMocks();
  });

  it('create: debe delegar en el servicio', async () => {
    const dto = { name: 'Sem 1' } as any;
    mockService.create.mockResolvedValue({ id: 1 });
    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1 });
  });

  it('findAll: debe delegar en el servicio', async () => {
    mockService.findAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      lastPage: 1,
    });
    const result = await controller.findAll({} as any);
    expect(service.findAll).toHaveBeenCalled();
    expect(result.total).toBe(0);
  });

  it('findOne: debe delegar en el servicio', async () => {
    mockService.findOne.mockResolvedValue(mockSemester);
    const result = await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith(1);
    expect(result).toEqual(mockSemester);
  });

  it('update: debe delegar en el servicio', async () => {
    const dto = { name: 'Updated' } as any;
    mockService.update.mockResolvedValue({ id: 1, name: 'Updated' });
    const result = await controller.update('1', dto);
    expect(service.update).toHaveBeenCalledWith(1, dto);
    expect(result.name).toBe('Updated');
  });

  it('remove: debe delegar en el servicio', async () => {
    mockService.remove.mockResolvedValue({
      message: 'Semester marked as deleted',
    });
    const result = await controller.remove('1');
    expect(service.remove).toHaveBeenCalledWith(1);
    expect(result.message).toBe('Semester marked as deleted');
  });
});
