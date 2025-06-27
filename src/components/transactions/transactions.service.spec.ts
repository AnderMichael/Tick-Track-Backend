import {
  BadRequestException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { StudentsService } from '../students/students.service';
import { WorksService } from '../works/works.service';
import { TransactionModel } from './models/transaction.model';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

const mockTransactionsRepository = {
  create: jest.fn(),
  findAdministrativeByUpbcode: jest.fn(),
  findTotalCompleteHoursByInscriptionId: jest.fn(),
  markAsComplete: jest.fn(),
  markAsIncomplete: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  softDelete: jest.fn(),
  findStudentHeader: jest.fn(),
  isAdmin: jest.fn(),
  addStudentComment: jest.fn(),
  findInscriptionByUpbcodeAndSemester: jest.fn(),
};

const mockWorksService = {
  findOne: jest.fn(),
};

const mockStudentsService = {
  findInscriptionById: jest.fn(),
  findCommitmentById: jest.fn(),
  findInscription: jest.fn(),
};

describe('TransactionsService', () => {
  let service: TransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TransactionsService,
        {
          provide: TransactionsRepository,
          useValue: mockTransactionsRepository,
        },
        { provide: WorksService, useValue: mockWorksService },
        { provide: StudentsService, useValue: mockStudentsService },
      ],
    }).compile();

    service = module.get<TransactionsService>(TransactionsService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should create transaction and mark inscription complete if needed', async () => {
    mockWorksService.findOne.mockResolvedValue({
      id: 1,
      title: 'Work',
      semester_id: 1,
    });
    mockStudentsService.findInscriptionById.mockResolvedValue({
      id: 2,
      is_complete: false,
      commitmentId: 3,
    });
    mockTransactionsRepository.findAdministrativeByUpbcode.mockResolvedValue({
      id: 5,
    });
    mockTransactionsRepository.create.mockResolvedValue({ id: 10 });
    mockTransactionsRepository.findTotalCompleteHoursByInscriptionId.mockResolvedValue(
      30,
    );
    mockStudentsService.findCommitmentById.mockResolvedValue({
      service_details: { hours_per_semester: 20 },
    });

    const result = await service.create({
      work_id: 1,
      inscription_id: 2,
      author_id: 99,
    } as any);

    expect(result).toEqual({
      message: `Succesful Payment! Transaction N° 10 to work "Work"`,
    });
    expect(mockTransactionsRepository.markAsComplete).toHaveBeenCalled();
  });

  it('should throw NotFound if work not found', async () => {
    mockWorksService.findOne.mockResolvedValue(null);
    await expect(service.create({ work_id: 1 } as any)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should find all transactions with models mapped', async () => {
    mockTransactionsRepository.findAll.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      lastPage: 0,
    });
    const result = await service.findAll({} as any);
    expect(result).toEqual({ data: [], total: 0, page: 1, lastPage: 0 });
  });

  it('should find one transaction', async () => {
    const mockTransaction = {
      id: 1,
      hours: 10,
      date: '2024-06-01',
      comment_student: '',
      comment_administrative: '',
      is_deleted: false,
      qualification: {
        name: 'Excelente',
      },
      inscription: {
        commitment: {
          id: 5,
          student: {
            user: {
              firstName: 'Luis',
              fatherLastName: 'Gonzales',
              upbCode: 20201234,
            },
          },
        },
      },
      work: {
        id: 7,
        title: 'Voluntariado',
        semester_id: 2,
        administrative: {
          user: {
            firstName: 'Maria',
            fatherLastName: 'Rodriguez',
          },
        },
      },
      author: {
        user: {
          firstName: 'Pedro',
          fatherLastName: 'López',
        },
      },
    };

    jest.spyOn(mockTransactionsRepository, 'findOne').mockResolvedValue(mockTransaction as any);

    const result = await service.findOne(1);
    expect(result).toBeInstanceOf(TransactionModel);
    expect(result.id).toBe(1);
    expect(result.hours).toBe(10);
    expect(result.administrative_name).toBe('Maria Rodriguez');
    expect(result.work_name).toBe('Voluntariado');
    expect(result.student_name).toBe('Luis Gonzales');
    expect(result.student_upbCode).toBe(20201234);
    expect(result.author_name).toBe('Pedro López');
    expect(result.qualification_name).toBe('Excelente');
    expect(result.work).toEqual({ work_id: 7, semester_id: 2 });
  });

  it('should throw NotFound if transaction is deleted', async () => {
    mockTransactionsRepository.findOne.mockResolvedValue({ is_deleted: true });
    await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
  });

  it('should remove transaction and mark as incomplete if needed', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      id: 1,
      work: { semester_id: 1 },
      commitment_id: 2,
    } as any);
    mockTransactionsRepository.softDelete.mockResolvedValue(null);
    mockStudentsService.findInscription.mockResolvedValue({
      id: 4,
      commitment_id: 2,
      is_complete: true,
    });
    mockTransactionsRepository.findTotalCompleteHoursByInscriptionId.mockResolvedValue(
      10,
    );
    mockStudentsService.findCommitmentById.mockResolvedValue({
      service_details: { hours_per_semester: 20 },
    });

    const result = await service.remove(1);
    expect(result).toEqual({ message: 'Transaction marked as deleted' });
    expect(mockTransactionsRepository.markAsIncomplete).toHaveBeenCalledWith(4);
  });

  it('should get student header info and validate department', async () => {
    mockTransactionsRepository.findInscriptionByUpbcodeAndSemester.mockResolvedValue(
      { id: 1 },
    );
    mockTransactionsRepository.findStudentHeader.mockResolvedValue({
      department_id: 5,
    });
    mockTransactionsRepository.isAdmin.mockResolvedValue(false);

    await expect(service.getStudentHeaderInfo(123, 6, 1, 2)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should add comment if valid', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockResolvedValue({ id: 1, student_upbCode: 123 } as any);
    const result = await service.addStudentComment(1, 'test comment', 123);
    expect(result).toEqual({ message: 'Comment added successfully' });
  });

  it('should throw if student is not authorized to comment', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockResolvedValue({ student_upbCode: 999 } as any);
    await expect(service.addStudentComment(1, 'abc', 123)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if comment is empty', async () => {
    jest
      .spyOn(service, 'findOne')
      .mockResolvedValue({ student_upbCode: 123 } as any);
    await expect(service.addStudentComment(1, '', 123)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw if comment already exists', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue({
      student_upbCode: 123,
      comment_student: 'exists',
    } as any);
    await expect(service.addStudentComment(1, 'new', 123)).rejects.toThrow(
      BadRequestException,
    );
  });
});
