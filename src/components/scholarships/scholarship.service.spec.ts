import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ScholarshipsRepository } from './scholarships.repository';
import { ScholarshipsService } from './scholarships.service';

const mockScholarshipsRepository = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  createServiceDetails: jest.fn(),
  findAllServiceDetails: jest.fn(),
  findServiceDetails: jest.fn(),
  updateServiceDetails: jest.fn(),
  softDeleteServiceDetails: jest.fn(),
  countCommitmentsByServiceDetails: jest.fn(),
  countServiceDetailsByScholarship: jest.fn(),
  findCommitmentByServiceDetailsAndStudent: jest.fn(),
  findStudentByUpbCode: jest.fn(),
  createCommitment: jest.fn(),
});

describe('ScholarshipsService', () => {
  let service: ScholarshipsService;
  let repository: jest.Mocked<ReturnType<typeof mockScholarshipsRepository>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScholarshipsService,
        {
          provide: ScholarshipsRepository,
          useFactory: mockScholarshipsRepository,
        },
      ],
    }).compile();

    service = module.get(ScholarshipsService);
    repository = module.get(ScholarshipsRepository);
  });

  it('create: debería crear una beca', async () => {
    const dto = { name: 'Beca' } as any;
    repository.create.mockResolvedValue({ id: 1, ...dto });
    const result = await service.create(dto);
    expect(result).toHaveProperty('id', 1);
    expect(repository.create).toHaveBeenCalledWith(dto);
  });

  it('findOne: lanza NotFoundException si no existe', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('update: debería actualizar una beca', async () => {
    repository.findOne.mockResolvedValue({ id: 1, is_deleted: false } as any);
    repository.update.mockResolvedValue({ id: 1, name: 'Updated' } as any);
    const result = await service.update(1, { name: 'Updated' } as any);
    expect(result).toHaveProperty('name', 'Updated');
  });

  it('remove: lanza error si tiene detalles de servicio', async () => {
    repository.findOne.mockResolvedValue({ id: 1, is_deleted: false } as any);
    repository.countServiceDetailsByScholarship.mockResolvedValue(1);
    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });

  it('createServiceDetails: lanza error si el porcentaje ya existe', async () => {
    repository.findOne.mockResolvedValue({ id: 1 } as any);
    repository.findAllServiceDetails.mockResolvedValue([{ percentage: 0.5 }]);
    await expect(
      service.createServiceDetails(1, { percentage: 0.5 } as any),
    ).rejects.toThrow(ConflictException);
  });

  it('updateServiceDetails: lanza error si el porcentaje ya existe', async () => {
    repository.findServiceDetails.mockResolvedValue({ id: 2 } as any);
    repository.findAllServiceDetails.mockResolvedValue([
      { percentage: 0.4 },
      { percentage: 0.5 },
    ]);
    await expect(
      service.updateServiceDetails(1, 2, { percentage: 0.5 } as any),
    ).rejects.toThrow(NotFoundException);
  });

  it('removeServiceDetails: lanza error si hay compromisos', async () => {
    repository.findServiceDetails.mockResolvedValue({ id: 1 } as any);
    repository.countCommitmentsByServiceDetails.mockResolvedValue(1);
    await expect(service.removeServiceDetails(1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('associateScholarship: lanza error si estudiante no existe', async () => {
    repository.findStudentByUpbCode.mockResolvedValue(null);
    await expect(service.associateScholarship(1, 2)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('associateScholarship: lanza error si ya hay compromiso', async () => {
    repository.findStudentByUpbCode.mockResolvedValue({ id: 1 } as any);
    repository.findServiceDetails.mockResolvedValue({ id: 2 } as any);
    repository.findCommitmentByServiceDetailsAndStudent.mockResolvedValue({});
    await expect(service.associateScholarship(123, 2)).rejects.toThrow(
      ConflictException,
    );
  });

  it('associateScholarship: debería crear compromiso', async () => {
    repository.findStudentByUpbCode.mockResolvedValue({ id: 1 } as any);
    repository.findServiceDetails.mockResolvedValue({ id: 2 } as any);
    repository.findCommitmentByServiceDetailsAndStudent.mockResolvedValue(null);
    const result = await service.associateScholarship(123, 2);
    expect(result).toHaveProperty('message');
    expect(repository.createCommitment).toHaveBeenCalledWith(1, 2);
  });
});
