import { prisma } from '../../config/prisma.client';
import { SemestersRepository } from './semesters.repository';

jest.mock('../../config/prisma.client', () => ({
  prisma: {
    semester: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    inscription: {
      count: jest.fn(),
    },
    work: {
      count: jest.fn(),
    },
  },
}));

describe('SemestersRepository', () => {
  let repository: SemestersRepository;

  beforeEach(() => {
    repository = new SemestersRepository();
    jest.clearAllMocks();
  });

  it('create: debería crear un semestre', async () => {
    const dto = {
      name: 'Semestre 1',
      start_date: new Date(),
      end_date: new Date(),
      number: 1,
      year: 2024,
    };
    (prisma.semester.create as jest.Mock).mockResolvedValue({ id: 1 });

    const result = await repository.create(dto as any);
    expect(prisma.semester.create).toHaveBeenCalledWith({ data: dto });
    expect(result).toEqual({ id: 1 });
  });

  it('findAll: debería retornar semestres paginados', async () => {
    const pagination = {
      page: 1,
      limit: 5,
      buildSemesterWhere: () => ({}),
    } as any;

    (prisma.semester.findMany as jest.Mock).mockResolvedValue([
      { id: 1 },
      { id: 2 },
    ]);
    (prisma.semester.count as jest.Mock).mockResolvedValue(10);

    const result = await repository.findAll(pagination);

    expect(prisma.semester.findMany).toHaveBeenCalled();
    expect(prisma.semester.count).toHaveBeenCalled();
    expect(result.total).toBe(10);
    expect(result.page).toBe(1);
    expect(result.lastPage).toBe(2);
  });

  it('findOne: debería retornar un semestre por ID', async () => {
    await repository.findOne(1);
    expect(prisma.semester.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('update: debería actualizar un semestre', async () => {
    const dto = { name: 'Actualizado' };
    await repository.update(1, dto as any);
    expect(prisma.semester.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: dto,
    });
  });

  it('softDelete: debería marcar semestre como eliminado', async () => {
    await repository.softDelete(1);
    expect(prisma.semester.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_deleted: true },
    });
  });

  it('findOverlapping: debería encontrar semestres solapados sin excluir ID', async () => {
    await repository.findOverlapping('2024-01-01', '2024-06-30');
    expect(prisma.semester.findMany).toHaveBeenCalledWith({
      where: {
        is_deleted: false,
        start_date: { lte: '2024-06-30' },
        end_date: { gte: '2024-01-01' },
      },
    });
  });

  it('findOverlapping: debería excluir un ID si se proporciona', async () => {
    await repository.findOverlapping('2024-01-01', '2024-06-30', 5);
    expect(prisma.semester.findMany).toHaveBeenCalledWith({
      where: {
        is_deleted: false,
        start_date: { lte: '2024-06-30' },
        end_date: { gte: '2024-01-01' },
        NOT: { id: 5 },
      },
    });
  });

  it('countInscriptions: debería contar inscripciones activas', async () => {
    (prisma.inscription.count as jest.Mock).mockResolvedValue(3);
    const result = await repository.countInscriptions(1);
    expect(prisma.inscription.count).toHaveBeenCalledWith({
      where: { semester_id: 1, is_deleted: false },
    });
    expect(result).toBe(3);
  });

  it('countWorks: debería contar trabajos activos', async () => {
    (prisma.work.count as jest.Mock).mockResolvedValue(4);
    const result = await repository.countWorks(1);
    expect(prisma.work.count).toHaveBeenCalledWith({
      where: { semester_id: 1, is_deleted: false },
    });
    expect(result).toBe(4);
  });
});
