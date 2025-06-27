import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SemestersRepository } from './semesters.repository';
import { SemestersService } from './semesters.service';

describe('SemestersService', () => {
  let service: SemestersService;
  let repository: jest.Mocked<SemestersRepository>;

  const mockSemester = {
    id: 1,
    name: 'Sem 1',
    number: 1,
    year: 2024,
    start_date: '2024-01-01',
    end_date: '2024-06-30',
    is_deleted: false,
  };

  const repositoryMock: Partial<jest.Mocked<SemestersRepository>> = {
    findOverlapping: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    countInscriptions: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SemestersService,
        {
          provide: SemestersRepository,
          useValue: repositoryMock,
        },
      ],
    }).compile();

    service = module.get<SemestersService>(SemestersService);
    repository = module.get(SemestersRepository);
    jest.clearAllMocks();
  });

  it('create: debería lanzar error si hay solapamiento', async () => {
    repository.findOverlapping.mockResolvedValue([mockSemester] as any);
    await expect(service.create(mockSemester as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('create: debería crear semestre si no hay solapamiento', async () => {
    repository.findOverlapping.mockResolvedValue([]);
    repository.create.mockResolvedValue(mockSemester as any);

    const result = await service.create(mockSemester as any);
    expect(repository.create).toHaveBeenCalledWith(mockSemester);
    expect(result).toHaveProperty('id', 1);
  });

  it('findAll: debería retornar los semestres paginados con modelo', async () => {
    repository.findAll.mockResolvedValue({
      data: [mockSemester as any],
      total: 1,
      page: 1,
      lastPage: 1,
    });
    const result = await service.findAll({} as any);
    expect(result.data[0]).toHaveProperty('id', 1);
    expect(result.total).toBe(1);
  });

  it('findOne: debería lanzar error si no existe o está eliminado', async () => {
    repository.findOne.mockResolvedValue(null);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);

    repository.findOne.mockResolvedValue({
      ...mockSemester,
      is_deleted: true,
    } as any);
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('findOne: debería retornar el modelo si existe', async () => {
    repository.findOne.mockResolvedValue(mockSemester as any);
    const result = await service.findOne(1);
    expect(result).toHaveProperty('id', 1);
  });

  it('update: debería lanzar error si hay solapamiento', async () => {
    repository.findOne.mockResolvedValue(mockSemester as any);
    repository.findOverlapping.mockResolvedValue([mockSemester] as any);
    await expect(service.update(1, {} as any)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('update: debería actualizar si no hay solapamiento', async () => {
    repository.findOne.mockResolvedValue(mockSemester as any);
    repository.findOverlapping.mockResolvedValue([]);
    repository.update.mockResolvedValue({
      ...mockSemester,
      name: 'Updated',
    } as any);

    const result = await service.update(1, { name: 'Updated' } as any);

    expect(result).toHaveProperty('id', 1);
    expect(result).toBeInstanceOf(Object);
  });

  it('remove: debería lanzar error si hay inscripciones', async () => {
    repository.findOne.mockResolvedValue(mockSemester as any);
    repository.countInscriptions.mockResolvedValue(2);
    await expect(service.remove(1)).rejects.toThrow(BadRequestException);
  });

  it('remove: debería marcar como eliminado si no hay inscripciones', async () => {
    repository.findOne.mockResolvedValue(mockSemester as any);
    repository.countInscriptions.mockResolvedValue(0);
    repository.softDelete.mockResolvedValue(undefined as any);

    const result = await service.remove(1);
    expect(result.message).toBe('Semester marked as deleted');
  });
});
