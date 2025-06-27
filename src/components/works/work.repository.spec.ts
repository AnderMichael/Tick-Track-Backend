import { WorksRepository } from './works.repository';
import { prisma } from '../../config/prisma.client';

jest.mock('../../config/prisma.client', () => ({
  prisma: {
    administrative: { findFirst: jest.fn() },
    work: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    transaction: {
      count: jest.fn(),
    },
    work_history: {
      create: jest.fn(),
    },
  },
}));

describe('WorksRepository', () => {
  let repository: WorksRepository;

  beforeEach(() => {
    repository = new WorksRepository();
    jest.clearAllMocks();
  });

  it('create: debería crear un trabajo con administrative_id correcto', async () => {
    (prisma.administrative.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.work.create as jest.Mock).mockResolvedValue({ id: 10 });

    const dto = { title: 'Test', semester_id: 1, date_begin: new Date(), date_end: new Date() };
    const result = await repository.create(dto as any, 123);

    expect(prisma.administrative.findFirst).toHaveBeenCalledWith({
      where: { user: { upbCode: 123 } },
    });
    expect(prisma.work.create).toHaveBeenCalledWith({
      data: { ...dto, administrative_id: 1 },
    });
    expect(result).toEqual({ id: 10 });
  });

  it('findAll: debería retornar trabajos paginados con búsqueda', async () => {
    const pagination = {
      page: 2,
      limit: 5,
      search: 'test',
      buildWorkWhere: () => ({}),
    } as any;

    (prisma.work.findMany as jest.Mock).mockResolvedValue([{ id: 1 }, { id: 2 }]);
    (prisma.work.count as jest.Mock).mockResolvedValue(10);

    const result = await repository.findAll(pagination);

    expect(prisma.work.findMany).toHaveBeenCalled();
    expect(prisma.work.count).toHaveBeenCalled();
    expect(result.total).toBe(10);
    expect(result.page).toBe(2);
    expect(result.data.length).toBe(2);
  });

  it('findOne: debería obtener trabajo por ID con include', async () => {
    await repository.findOne(1);
    expect(prisma.work.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
      include: {
        semester: true,
        administrative: {
          include: { user: true },
        },
      },
    });
  });

  it('update: debería actualizar un trabajo', async () => {
    const dto = { title: 'Nuevo' };
    await repository.update(1, dto as any);
    expect(prisma.work.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
  });

  it('softDelete: debería marcar como eliminado', async () => {
    await repository.softDelete(1);
    expect(prisma.work.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_deleted: true },
    });
  });

  it('lock: debería cerrar el trabajo', async () => {
    await repository.lock(1);
    expect(prisma.work.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_open: false },
    });
  });

  it('unlock: debería abrir el trabajo', async () => {
    await repository.unlock(1);
    expect(prisma.work.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_open: true },
    });
  });

  it('countTransactions: debería contar transacciones activas', async () => {
    (prisma.transaction.count as jest.Mock).mockResolvedValue(3);
    const result = await repository.countTransactions(1);
    expect(prisma.transaction.count).toHaveBeenCalledWith({
      where: { work_id: 1, is_deleted: false },
    });
    expect(result).toBe(3);
  });

  it('createLog: debería crear historial de trabajo', async () => {
    const now = new Date();
    jest.useFakeTimers().setSystemTime(now);
    await repository.createLog('created', 1, 123);
    expect(prisma.work_history.create).toHaveBeenCalledWith({
      data: {
        status: 'created',
        work_id: 1,
        administrative_id: 123,
        date: now,
      },
    });
    jest.useRealTimers();
  });
});
