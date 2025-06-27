import { AdministrativeRepository } from './administratives.repository';
import { prisma } from '../../config/prisma.client';
import { BcryptUtils } from '../users/utils/bcrypt';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';

jest.mock('../../config/prisma.client', () => ({
  prisma: {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
    },
    administrative: {
      update: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
    department: {
      findMany: jest.fn(),
    },
    work: {
      count: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
    user_state_history: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../users/utils/bcrypt');

describe('AdministrativeRepository', () => {
  let repository: AdministrativeRepository;

  beforeEach(() => {
    repository = new AdministrativeRepository();
  });

  it('should create administrative user', async () => {
    const dto = {
      upbRole: 'COORD',
      firstName: 'Ana',
      upbCode: 123,
      email: 'ana@example.com',
    } as CreateAdministrativeDto;

    (BcryptUtils.prototype.getDefaultPassword as jest.Mock).mockResolvedValue('hashed');
    (prisma.user.create as jest.Mock).mockResolvedValue('user_created');

    const result = await repository.create(dto);

    expect(result).toBe('user_created');
    expect(prisma.user.create).toHaveBeenCalled();
  });

  it('should find all administrative users', async () => {
    const pagination = { page: 1, limit: 10, buildWhere: () => ({}) };

    (prisma.user.findMany as jest.Mock).mockResolvedValue(['user1']);
    (prisma.user.count as jest.Mock).mockResolvedValue(1);

    const result = await repository.findAll(pagination as any);

    expect(result.data).toEqual(['user1']);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.lastPage).toBe(1);
  });

  it('should update administrative user', async () => {
    const dto = { upbRole: 'DIR', email: 'update@example.com' } as UpdateAdministrativeDto;

    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.administrative.update as jest.Mock).mockResolvedValue({});
    (prisma.user.update as jest.Mock).mockResolvedValue('user_updated');

    const result = await repository.update(123, dto);

    expect(result).toBe('user_updated');
    expect(prisma.administrative.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { upb_role: 'DIR' },
    });
  });

  it('should soft delete an administrative', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 2 });

    const result = await repository.softDelete(123);

    expect(result).toEqual({ message: 'Administrative marked as deleted' });
    expect(prisma.administrative.update).toHaveBeenCalledWith({
      where: { id: 2 },
      data: { is_deleted: true },
    });
  });

  it('should get work summary', async () => {
    const dto = { upbCode: 101, department_id: 5 };
    const user = { id: 20 };

    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(user);
    (prisma.work.count as jest.Mock).mockResolvedValueOnce(3); // open
    (prisma.work.count as jest.Mock).mockResolvedValueOnce(2); // closed
    (prisma.work.count as jest.Mock).mockResolvedValueOnce(5); // total

    const result = await repository.getWorkSummary(dto, 1);

    expect(result).toEqual({ open: 3, closed: 2, total: 5 });
  });

  it('should lock an administrative', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 33 });
    (prisma.user.update as jest.Mock).mockResolvedValue('locked');

    const result = await repository.lock(123);

    expect(result).toBe('locked');
  });

  it('should unlock an administrative', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 99 });
    (prisma.user.update as jest.Mock).mockResolvedValue('unlocked');

    const result = await repository.unlock(456);

    expect(result).toBe('unlocked');
  });

  it('should count works by administrative', async () => {
    (prisma.work.count as jest.Mock).mockResolvedValue(7);

    const result = await repository.countWorksByAdministrative(1);

    expect(result).toBe(7);
  });

  it('should count transactions by administrative', async () => {
    (prisma.transaction.count as jest.Mock).mockResolvedValue(9);

    const result = await repository.countTransactionsByAdministrative(2);

    expect(result).toBe(9);
  });

  it('should add log to user state history', async () => {
    (prisma.user_state_history.create as jest.Mock).mockResolvedValue('log_created');

    const result = await repository.addLog('LOCKED', 1, 2);

    expect(result).toBe('log_created');
  });

  it('should find role', async () => {
    (prisma.role.findFirst as jest.Mock).mockResolvedValue('admin');

    const result = await repository.findRole('ADMIN');

    expect(result).toBe('admin');
  });

  it('should return all departments', async () => {
    (prisma.department.findMany as jest.Mock).mockResolvedValue(['dep1', 'dep2']);

    const result = await repository.findAllDepartments();

    expect(result).toEqual(['dep1', 'dep2']);
  });
});
