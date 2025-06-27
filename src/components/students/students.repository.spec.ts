import { prisma } from '../../config/prisma.client';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsRepository } from './students.repository';

jest.mock('../../config/prisma.client', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(), 
    },
    student: {
      update: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    commitment: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
    },
    inscription: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    user_state_history: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../users/utils/bcrypt', () => {
  return {
    BcryptUtils: jest.fn().mockImplementation(() => ({
      getDefaultPassword: jest.fn().mockResolvedValue('hashed'),
    })),
  };
});

describe('StudentsRepository', () => {
  let repo: StudentsRepository;

  beforeEach(() => {
    repo = new StudentsRepository();
    jest.clearAllMocks();
  });

  it('should create a student', async () => {
    const dto = { upbCode: 123, semester: 1 } as CreateStudentDto;
    (prisma.user.create as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await repo.create(dto);

    expect(prisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ upbCode: 123 }),
      }),
    );
    expect(result).toEqual({ id: 1 });
  });

  it('should find all students', async () => {
    const pagination = { page: 1, limit: 10, buildWhere: () => ({}) } as any;
    (prisma.user.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.user.count as jest.Mock).mockResolvedValue(0);

    const result = await repo.findAll(pagination);

    expect(result).toEqual({ data: [], total: 0, page: 1, lastPage: 0 });
  });

  it('should find one student', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
    const result = await repo.findOne(123);
    expect(result).toEqual({ id: 1 });
  });

  it('should update student and user', async () => {
    const dto = { semester: 2 } as UpdateStudentDto;
    (repo.findOne as any) = jest.fn().mockResolvedValue({ id: 1 });
    (prisma.student.update as jest.Mock).mockResolvedValue(null);
    (prisma.user.update as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await repo.update(123, dto);
    expect(result).toEqual({ id: 1 });
  });

  it('should soft delete a student', async () => {
    (repo.findOne as any) = jest.fn().mockResolvedValue({ id: 1 });
    const result = await repo.softDelete(123);
    expect(result).toEqual({ message: 'Student marked as deleted' });
  });

  it('should lock student', async () => {
    (repo.findOne as any) = jest.fn().mockResolvedValue({ id: 1 });
    await repo.lock(123);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isAvailable: false } }),
    );
  });

  it('should unlock student', async () => {
    (repo.findOne as any) = jest.fn().mockResolvedValue({ id: 1 });
    await repo.unlock(123);
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { isAvailable: true } }),
    );
  });

  it('should add log', async () => {
    await repo.addLog('locked', 1, 2);
    expect(prisma.user_state_history.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'locked' }),
      }),
    );
  });
});
