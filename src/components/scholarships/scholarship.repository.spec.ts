import { prisma } from '../../config/prisma.client';
import { ScholarshipsRepository } from './scholarships.repository';

jest.mock('../../config/prisma.client', () => ({
  prisma: {
    scholarship: {
      create: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    service_details: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn().mockResolvedValue(3),
    },
    user: {
      findFirst: jest.fn(),
    },
    student: {
      findFirst: jest.fn(),
    },
    commitment: {
      findFirst: jest.fn(),
      create: jest.fn(),
      updateMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

describe('ScholarshipsRepository', () => {
  let repository: ScholarshipsRepository;

  beforeEach(() => {
    repository = new ScholarshipsRepository();
    jest.clearAllMocks();
  });

  it('create: debería crear beca', async () => {
    const dto = { name: 'Beca 1' } as any;
    (prisma.scholarship.create as jest.Mock).mockResolvedValue({ id: 1 });
    const result = await repository.create(dto);
    expect(result).toEqual({ id: 1 });
  });

  it('findAll: debe retornar paginación de becas', async () => {
    (prisma.scholarship.findMany as jest.Mock).mockResolvedValue([{}]);
    (prisma.scholarship.count as jest.Mock).mockResolvedValue(1);
    const result = await repository.findAll({
      page: 1,
      limit: 10,
      buildWhere: () => ({}),
    } as any);
    expect(result.total).toBe(1);
  });

  it('findOne: debería retornar beca por ID', async () => {
    await repository.findOne(1);
    expect(prisma.scholarship.findUnique).toHaveBeenCalledWith({
      where: { id: 1 },
    });
  });

  it('update: debería actualizar una beca', async () => {
    await repository.update(1, { name: 'New' } as any);
    expect(prisma.scholarship.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'New' },
    });
  });

  it('softDelete: debería marcar beca como eliminada', async () => {
    await repository.softDelete(1);
    expect(prisma.scholarship.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_deleted: true },
    });
  });

  it('createServiceDetails: debería crear detalle de servicio', async () => {
    await repository.createServiceDetails(1, { percentage: 50 } as any);
    expect(prisma.service_details.create).toHaveBeenCalledWith({
      data: { scholarship_id: 1, percentage: 50 },
    });
  });

  it('findAllServiceDetails: debería listar detalles de servicio', async () => {
    await repository.findAllServiceDetails(1);
    expect(prisma.service_details.findMany).toHaveBeenCalledWith({
      where: { scholarship_id: 1, is_deleted: false },
      orderBy: { percentage: 'asc' },
    });
  });

  it('findServiceDetails: debería obtener detalle específico', async () => {
    await repository.findServiceDetails(1);
    expect(prisma.service_details.findUnique).toHaveBeenCalledWith({
      where: { id: 1, is_deleted: false },
    });
  });

  it('updateServiceDetails: debería actualizar detalle de servicio', async () => {
    await repository.updateServiceDetails(1, { percentage: 70 } as any);
    expect(prisma.service_details.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { percentage: 70 },
    });
  });

  it('softDeleteServiceDetails: debería marcar detalle como eliminado', async () => {
    await repository.softDeleteServiceDetails(1);
    expect(prisma.service_details.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { is_deleted: true },
    });
  });

  it('findCommitmentByServiceDetailsAndStudent: debería buscar compromiso', async () => {
    await repository.findCommitmentByServiceDetailsAndStudent(1, 2);
    expect(prisma.commitment.findFirst).toHaveBeenCalledWith({
      where: {
        service_details_id: 1,
        student: { id: 2, is_deleted: false },
      },
      include: {
        service_details: { include: { scholarship: true } },
        student: true,
      },
    });
  });

  it('findStudentByUpbCode: debería retornar null si user no existe', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue(null);
    const result = await repository.findStudentByUpbCode(123);
    expect(result).toBeNull();
  });

  it('findStudentByUpbCode: debería retornar student si existe', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
    (prisma.student.findFirst as jest.Mock).mockResolvedValue({ id: 1 });
    const result = await repository.findStudentByUpbCode(123);
    expect(result).toEqual({ id: 1 });
  });

  it('createCommitment: debería apagar el anterior y crear uno nuevo', async () => {
    const turnOffSpy = jest
      .spyOn(repository, 'turnOffCurrentCommitment')
      .mockResolvedValue({} as any);
    (prisma.commitment.create as jest.Mock).mockResolvedValue({});

    await repository.createCommitment(1, 2);
    expect(turnOffSpy).toHaveBeenCalledWith(1);
    expect(prisma.commitment.create).toHaveBeenCalledWith({
      data: {
        student_id: 1,
        service_details_id: 2,
        is_current: true,
      },
    });
  });

  it('turnOffCurrentCommitment: debería desactivar compromisos activos', async () => {
    await repository.turnOffCurrentCommitment(1);
    expect(prisma.commitment.updateMany).toHaveBeenCalledWith({
      where: { student_id: 1, is_current: true },
      data: { is_current: false },
    });
  });

  it('countCommitmentsByServiceDetails: debería contar compromisos', async () => {
    await repository.countCommitmentsByServiceDetails(1);
    expect(prisma.commitment.count).toHaveBeenCalledWith({
      where: { service_details_id: 1, is_deleted: false },
    });
  });

  it('countServiceDetailsByScholarship: debería contar detalles por beca', async () => {
    await repository.countServiceDetailsByScholarship(1);
    expect(prisma.service_details.count).toHaveBeenCalledWith({
      where: { scholarship_id: 1, is_deleted: false },
    });
  });
});
