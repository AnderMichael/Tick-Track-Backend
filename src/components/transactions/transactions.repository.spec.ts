import { Test, TestingModule } from '@nestjs/testing';
import { prisma } from '../../config/prisma.client';
import { TransactionsRepository } from './transactions.repository';

jest.mock('../../config/prisma.client', () => ({
  prisma: {
    transaction: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      aggregate: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    inscription: {
      update: jest.fn(),
      findFirst: jest.fn(),
    },
    administrative: {
      findFirst: jest.fn(),
    },
  },
}));

describe('TransactionsRepository', () => {
  let repository: TransactionsRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TransactionsRepository],
    }).compile();

    repository = module.get<TransactionsRepository>(TransactionsRepository);
  });

  it('should create a transaction', async () => {
    const dto = { description: 'Test' } as any;
    await repository.create(dto);
    expect(prisma.transaction.create).toHaveBeenCalledWith({ data: dto });
  });

  it('should find all transactions with pagination', async () => {
    const pagination = {
      page: 1,
      limit: 10,
      buildTransactionWhere: () => ({}),
    } as any;
    (prisma.transaction.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.transaction.count as jest.Mock).mockResolvedValue(0);

    const result = await repository.findAll(pagination);
    expect(result).toEqual({ data: [], total: 0, page: 1, lastPage: 0 });
  });

  it('should find one transaction by ID', async () => {
    await repository.findOne(1);
    expect(prisma.transaction.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: expect.any(Object),
    });
  });

  it('should soft delete a transaction', async () => {
    await repository.softDelete(1);
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_deleted: true },
    });
  });

  it('should find student header by upbCode', async () => {
    await repository.findStudentHeader(123);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: {
        upbCode: 123,
        student: { isNot: null },
      },
      select: {
        upbCode: true,
        firstName: true,
        fatherLastName: true,
        department_id: true,
      },
    });
  });

  it('should add student comment', async () => {
    await repository.addStudentComment(1, 'Comentario');
    expect(prisma.transaction.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { comment_student: { set: 'Comentario' } },
    });
  });

  it('should verify if role is admin', async () => {
    (prisma.role.findUnique as jest.Mock).mockResolvedValue({ name: 'ADMIN' });
    const isAdmin = await repository.isAdmin(1);
    expect(isAdmin).toBe(true);
  });

  it('should return total complete hours by inscription id', async () => {
    (prisma.transaction.aggregate as jest.Mock).mockResolvedValue({
      _sum: { hours: 15 },
    });
    const result = await repository.findTotalCompleteHoursByInscriptionId(1);
    expect(result).toBe(15);
  });

  it('should mark inscription as complete', async () => {
    await repository.markAsComplete(1);
    expect(prisma.inscription.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_complete: true },
    });
  });

  it('should mark inscription as incomplete', async () => {
    await repository.markAsIncomplete(1);
    expect(prisma.inscription.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_complete: false },
    });
  });

  it('should find administrative by upbCode', async () => {
    await repository.findAdministrativeByUpbcode(123);
    expect(prisma.administrative.findFirst).toHaveBeenCalledWith({
      where: {
        user: {
          upbCode: 123,
        },
      },
    });
  });

  it('should find inscription by upbCode and semester', async () => {
    await repository.findInscriptionByUpbcodeAndSemester(123, 2);
    expect(prisma.inscription.findFirst).toHaveBeenCalledWith({
      where: {
        commitment: {
          student: {
            user: {
              upbCode: 123,
            },
          },
        },
        semester_id: 2,
      },
    });
  });
});
