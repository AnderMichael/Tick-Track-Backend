import { Test, TestingModule } from '@nestjs/testing';
import { WorksService } from './works.service';
import { WorksRepository } from './works.repository';
import { SemestersService } from '../semesters/semesters.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('WorksService', () => {
  let service: WorksService;
  let worksRepository: jest.Mocked<WorksRepository>;
  let semestersService: jest.Mocked<SemestersService>;

  const mockSemester = {
    id: 1,
    start_date: new Date('2024-01-01'),
    end_date: new Date('2024-06-30'),
    name: 'Primer Semestre',
    number: 1,
    year: 2024,
  };

  const baseWork = {
    id: 1,
    administrative_id: 123,
    semester_id: 1,
    title: 'Trabajo de prueba',
    date_begin: new Date('2024-02-01'),
    date_end: new Date('2024-04-01'),
    is_open: true,
    is_deleted: false,
    description: '',
    created_at: new Date(),
    updated_at: new Date(),
  };

  const mockWork = {
    ...baseWork,
    administrative: {
      user: {
        id: 123,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        firstName: 'Juan',
        secondName: 'Pablo',
        fatherLastName: 'Pérez',
        motherLastName: 'Gómez',
        email: 'jp@example.com',
        isAvailable: true,
        upbCode: 123456,
        is_confirmed: true,
        phone: '12345678',
        hashed_password: 'secret',
        role_id: 1,
        department_id: 1,
      },
    },
    semester: mockSemester,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WorksService,
        {
          provide: WorksRepository,
          useValue: {
            create: jest.fn(),
            createLog: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            countTransactions: jest.fn(),
            softDelete: jest.fn(),
            lock: jest.fn(),
            unlock: jest.fn(),
          },
        },
        {
          provide: SemestersService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(WorksService);
    worksRepository = module.get(WorksRepository);
    semestersService = module.get(SemestersService);
  });

  describe('create', () => {
    it('debe crear un trabajo si las fechas están dentro del semestre', async () => {
      const dto = {
        semester_id: 1,
        title: 'Trabajo test',
        date_begin: new Date('2024-02-01'),
        date_end: new Date('2024-04-01'),
      };

      semestersService.findOne.mockResolvedValue(mockSemester as any);
      worksRepository.create.mockResolvedValue(baseWork as any);
      worksRepository.createLog.mockResolvedValue({
        id: 1,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        administrative_id: 123,
        work_id: 1,
        status: 'created',
        date: new Date(),
      });

      const result = await service.create(dto as any, 123);
      expect(result.message).toContain('created successfully');
    });

    it('debe lanzar error si las fechas están fuera del semestre', async () => {
      const dto = {
        semester_id: 1,
        title: 'Trabajo inválido',
        date_begin: new Date('2023-12-01'),
        date_end: new Date('2024-04-01'),
      };

      semestersService.findOne.mockResolvedValue(mockSemester as any);

      await expect(service.create(dto as any, 123)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findOne', () => {
    it('debe retornar el trabajo si existe', async () => {
      worksRepository.findOne.mockResolvedValue(mockWork as any);
      const result = await service.findOne(1);
      expect(result).toHaveProperty('id', 1);
    });

    it('debe lanzar error si no existe', async () => {
      worksRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne(99)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('debe actualizar un trabajo válido', async () => {
      const updateDto = {
        title: 'Nuevo título',
        date_begin: new Date('2024-03-01'),
        date_end: new Date('2024-05-01'),
      };

      worksRepository.findOne.mockResolvedValue(mockWork as any);
      semestersService.findOne.mockResolvedValue(mockSemester as any);
      worksRepository.update.mockResolvedValue({ ...baseWork, ...updateDto } as any);
      worksRepository.createLog.mockResolvedValue({} as any);

      const result = await service.update(1, updateDto as any, 123);
      expect(result.message).toContain('created successfully');
    });

    it('debe lanzar error si nuevas fechas están fuera del semestre', async () => {
      const invalidDto = {
        date_begin: new Date('2023-01-01'),
      };

      worksRepository.findOne.mockResolvedValue(mockWork as any);
      semestersService.findOne.mockResolvedValue(mockSemester as any);

      await expect(
        service.update(1, invalidDto as any, 123),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('debe eliminar un trabajo sin transacciones', async () => {
      worksRepository.findOne.mockResolvedValue(mockWork as any);
      worksRepository.countTransactions.mockResolvedValue(0);
      worksRepository.softDelete.mockResolvedValue(baseWork as any);
      worksRepository.createLog.mockResolvedValue({} as any);

      const result = await service.remove(1, 123);
      expect(result.message).toBe('Work marked as deleted');
    });

    it('debe lanzar error si hay transacciones registradas', async () => {
      worksRepository.findOne.mockResolvedValue(mockWork as any);
      worksRepository.countTransactions.mockResolvedValue(2);

      await expect(service.remove(1, 123)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('lock', () => {
    it('debe bloquear un trabajo abierto', async () => {
      worksRepository.findOne.mockResolvedValue(mockWork as any);
      worksRepository.lock.mockResolvedValue(baseWork as any);
      worksRepository.createLog.mockResolvedValue({} as any);

      const result = await service.lock(1, 123);
      expect(result.message).toContain('locked successfully');
    });

    it('debe lanzar error si el trabajo ya está bloqueado', async () => {
      const lockedWork = { ...mockWork, is_open: false };
      worksRepository.findOne.mockResolvedValue(lockedWork as any);

      await expect(service.lock(1, 123)).rejects.toThrow(BadRequestException);
    });
  });

  describe('unlock', () => {
    it('debe desbloquear un trabajo bloqueado', async () => {
      const lockedWork = { ...mockWork, is_open: false };
      worksRepository.findOne.mockResolvedValue(lockedWork as any);
      worksRepository.unlock.mockResolvedValue(baseWork as any);
      worksRepository.createLog.mockResolvedValue({} as any);

      const result = await service.unlock(1, 123);
      expect(result.message).toContain('unlocked successfully');
    });

    it('debe lanzar error si ya está desbloqueado', async () => {
      worksRepository.findOne.mockResolvedValue(mockWork as any);

      await expect(service.unlock(1, 123)).rejects.toThrow(BadRequestException);
    });
  });
});
