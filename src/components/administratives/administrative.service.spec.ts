import { Test, TestingModule } from '@nestjs/testing';
import { AdministrativesService } from './administratives.service';
import { AdministrativeRepository } from './administratives.repository';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';
import { AdministrativePaginationDto } from '../common/dto/user.pagination.dto';
import { TrackSummaryDto } from './dto/track-summary.dto';

const mockRepo = () => ({
  findOne: jest.fn(),
  create: jest.fn(),
  addLog: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  countWorksByAdministrative: jest.fn(),
  countTransactionsByAdministrative: jest.fn(),
  softDelete: jest.fn(),
  findRole: jest.fn(),
  getWorkSummary: jest.fn(),
  findAllDepartments: jest.fn(),
  lock: jest.fn(),
  unlock: jest.fn(),
});

const mockUser = {
  id: 1,
  upbCode: 123,
  isAvailable: true,
  is_confirmed: true,
  phone: '123456',
  department: { id: 1 },
  administrative: { id: 1, upb_role: 'SUPERVISOR' },
};

describe('AdministrativesService', () => {
  let service: AdministrativesService;
  let repo: ReturnType<typeof mockRepo>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdministrativesService,
        { provide: AdministrativeRepository, useFactory: mockRepo },
      ],
    }).compile();

    service = module.get<AdministrativesService>(AdministrativesService);
    repo = module.get(AdministrativeRepository);
  });

  it('should create a new administrative', async () => {
    const dto = { upbCode: 123 } as CreateAdministrativeDto;
    repo.findOne.mockResolvedValue(null);
    repo.create.mockResolvedValue(mockUser);

    await service.create(dto, 1);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(repo.addLog).toHaveBeenCalledWith('created', 1, 1);
  });

  it('should throw if administrative already exists on create', async () => {
    repo.findOne.mockResolvedValue({});
    await expect(service.create({} as CreateAdministrativeDto, 1)).rejects.toThrow(BadRequestException);
  });

  it('should return paginated results with model mapping', async () => {
    repo.findAll.mockResolvedValue({ data: [mockUser], total: 1, page: 1, lastPage: 1 });
    const result = await service.findAll({} as AdministrativePaginationDto);
    expect(result.data.length).toBe(1);
  });

  it('should throw if administrative not found in findOne', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should update administrative and log the change', async () => {
    repo.findOne.mockResolvedValue(mockUser);
    repo.update.mockResolvedValue(mockUser);

    await service.update(1, {} as UpdateAdministrativeDto, 2);

    expect(repo.update).toHaveBeenCalled();
    expect(repo.addLog).toHaveBeenCalledWith('updated', 1, 2);
  });

  it('should remove administrative if no dependencies', async () => {
    repo.findOne.mockResolvedValue(mockUser);
    repo.countWorksByAdministrative.mockResolvedValue(0);
    repo.countTransactionsByAdministrative.mockResolvedValue(0);
    repo.softDelete.mockResolvedValue({});

    await service.remove(123, 1);

    expect(repo.softDelete).toHaveBeenCalledWith(123);
    expect(repo.addLog).toHaveBeenCalledWith('deleted', 1, 1);
  });

  it('should throw on remove if administrative has works', async () => {
    repo.findOne.mockResolvedValue(mockUser);
    repo.countWorksByAdministrative.mockResolvedValue(1);
    await expect(service.remove(1, 2)).rejects.toThrow(BadRequestException);
  });

  it('should throw on remove if administrative has transactions', async () => {
    repo.findOne.mockResolvedValue(mockUser);
    repo.countWorksByAdministrative.mockResolvedValue(0);
    repo.countTransactionsByAdministrative.mockResolvedValue(1);
    await expect(service.remove(1, 2)).rejects.toThrow(BadRequestException);
  });

  it('should find all by role', async () => {
    repo.findRole.mockResolvedValue({ id: 5 });
    repo.findAll.mockResolvedValue({ data: [mockUser], total: 1, page: 1, lastPage: 1 });
    const result = await service.findByRole('SUPERVISOR', {} as AdministrativePaginationDto);
    expect(result.data.length).toBe(1);
  });

  it('should throw if role not found', async () => {
    repo.findRole.mockResolvedValue(null);
    await expect(service.findByRole('UNKNOWN', {} as AdministrativePaginationDto)).rejects.toThrow(NotFoundException);
  });

  it('should return work summary', async () => {
    repo.getWorkSummary.mockResolvedValue({ open: 1, closed: 2, total: 3 });
    const result = await service.getWorkSummary({} as TrackSummaryDto, 1);
    expect(result).toEqual({ open: 1, closed: 2, total: 3 });
  });

  it('should return departments', async () => {
    repo.findAllDepartments.mockResolvedValue([{ id: 1, name: 'Dept' }]);
    const result = await service.findAllDepartments();
    expect(result).toEqual([{ id: 1, value: 'Dept' }]);
  });

  it('should throw if no departments found', async () => {
    repo.findAllDepartments.mockResolvedValue([]);
    await expect(service.findAllDepartments()).rejects.toThrow(NotFoundException);
  });

  it('should lock administrative', async () => {
    repo.findOne.mockResolvedValue(mockUser);
    repo.lock.mockResolvedValue(mockUser);
    await service.lock(123, 456);
    expect(repo.addLog).toHaveBeenCalledWith('locked', 1, 456);
  });

  it('should unlock administrative', async () => {
    repo.findOne.mockResolvedValue(mockUser);
    repo.unlock.mockResolvedValue(mockUser);
    await service.unlock(123, 456);
    expect(repo.addLog).toHaveBeenCalledWith('unlocked', 1, 456);
  });
});
