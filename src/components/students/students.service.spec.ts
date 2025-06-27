import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { SemestersService } from '../semesters/semesters.service';
import { TransactionsRepository } from '../transactions/transactions.repository';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';

const mockRepo = () => ({
  findUserByUpbCode: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  addLog: jest.fn(),
  findAll: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  countCommitmentsByStudentId: jest.fn(),
  findCurrentCommitmentByUpbCode: jest.fn(),
  findInscription: jest.fn(),
  uninscribeStudent: jest.fn(),
  findCommitmentById: jest.fn(),
  findInscriptionById: jest.fn(),
  getTrackedHours: jest.fn(),
  lock: jest.fn(),
  unlock: jest.fn(),
  findCommitmentsByUpbCode: jest.fn(),
  getInscriptionsByCommitmentAndYear: jest.fn(),
  updateInscription: jest.fn(),
  findInscriptionByUpbcodeSemesterId: jest.fn(),
  inscribeStudent: jest.fn(),
});

const mockSemesterService = () => ({
  findOne: jest.fn(),
});

const mockTransactionsRepo = () => ({
  findTotalCompleteHoursByInscriptionId: jest.fn(),
  markAsComplete: jest.fn(),
  markAsIncomplete: jest.fn(),
});

describe('StudentsService', () => {
  let service: StudentsService;
  let repo: ReturnType<typeof mockRepo>;
  let semesterService: ReturnType<typeof mockSemesterService>;
  let transactionsRepo: ReturnType<typeof mockTransactionsRepo>;
  const mockStudent = {
    id: 1,
    upbCode: 123,
    firstName: 'Test',
    secondName: '',
    fatherLastName: 'Apellido',
    motherLastName: '',
    email: 'test@example.com',
    is_deleted: false,
    is_confirmed: false,
    phone: '123456789',
    isAvailable: true,
    role: { id: 1, name: 'Student' },
    department: { id: 1, name: 'Ingeniería' },
    student: { semester: 1 },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        { provide: StudentsRepository, useFactory: mockRepo },
        { provide: SemestersService, useFactory: mockSemesterService },
        { provide: TransactionsRepository, useFactory: mockTransactionsRepo },
      ],
    }).compile();

    service = module.get(StudentsService);
    repo = module.get(StudentsRepository);
    semesterService = module.get(SemestersService);
    transactionsRepo = module.get(TransactionsRepository);
  });

  it('should create a student if none exists', async () => {
    repo.findUserByUpbCode.mockResolvedValue(null);
    repo.findOne.mockResolvedValue(null);
    repo.create.mockResolvedValue(mockStudent);
    await service.create({ upbCode: 123 } as any, 1);
    expect(repo.create).toHaveBeenCalled();
    expect(repo.addLog).toHaveBeenCalled();
  });

  it('should throw if user with upbCode exists', async () => {
    repo.findUserByUpbCode.mockResolvedValue({});
    await expect(service.create({ upbCode: 123 } as any, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if student already exists', async () => {
    repo.findUserByUpbCode.mockResolvedValue(null);
    repo.findOne.mockResolvedValue({});
    await expect(service.create({ upbCode: 123 } as any, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should find one student or throw NotFound', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.findOne(123)).rejects.toThrow(NotFoundException);
  });

  it('should remove student if no commitments', async () => {
    repo.findOne.mockResolvedValue(mockStudent);
    repo.countCommitmentsByStudentId.mockResolvedValue(0);
    await service.remove(123, 2);
    expect(repo.softDelete).toHaveBeenCalled();
    expect(repo.addLog).toHaveBeenCalled();
  });

  it('should throw if student has commitments', async () => {
    repo.findOne.mockResolvedValue(mockStudent);
    repo.countCommitmentsByStudentId.mockResolvedValue(1);
    await expect(service.remove(123, 2)).rejects.toThrow(BadRequestException);
  });

  it('should inscribe a student', async () => {
    repo.findCommitmentById.mockResolvedValue({ id: 1 });
    semesterService.findOne.mockResolvedValue({ id: 2 });
    repo.findInscription.mockResolvedValue(null);
    await service.inscribeStudent(1, 2, 1);
    expect(repo.inscribeStudent).toHaveBeenCalledWith(1, 2);
  });

  it('should throw if already inscribed', async () => {
    repo.findCommitmentById.mockResolvedValue({ id: 1 });
    semesterService.findOne.mockResolvedValue({ id: 2 });
    repo.findInscription.mockResolvedValue({});
    await expect(service.inscribeStudent(1, 2, 1)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should lock and unlock a student', async () => {
    repo.findOne.mockResolvedValue({ id: 1 });
    await service.lock(123, 456);
    await service.unlock(123, 456);
    expect(repo.lock).toHaveBeenCalled();
    expect(repo.unlock).toHaveBeenCalled();
  });

  it('should throw when trying to lock/unlock nonexistent student', async () => {
    repo.findOne.mockResolvedValue(null);
    await expect(service.lock(123, 456)).rejects.toThrow(NotFoundException);
    await expect(service.unlock(123, 456)).rejects.toThrow(NotFoundException);
  });
});
