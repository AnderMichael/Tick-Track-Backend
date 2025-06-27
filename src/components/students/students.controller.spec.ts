import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

describe('StudentsController', () => {
  let controller: StudentsController;
  let service: StudentsService;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    inscribeStudent: jest.fn(),
    removeInscription: jest.fn(),
    getTrackingBySemester: jest.fn(),
    findCommitmentById: jest.fn(),
    lock: jest.fn(),
    unlock: jest.fn(),
    findStudentCommitments: jest.fn(),
    getInscriptions: jest.fn(),
    updateInscription: jest.fn(),
    findInscriptionById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [StudentsController],
      providers: [{ provide: StudentsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(UserAvailableGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<StudentsController>(StudentsController);
    service = module.get<StudentsService>(StudentsService);
  });

  it('should create a student', () => {
    controller.create({} as any, { user: { id: 1 } } as any);
    expect(service.create).toHaveBeenCalled();
  });

  it('should list students', () => {
    controller.findAll({} as any);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should find one student', () => {
    controller.findOne('123');
    expect(service.findOne).toHaveBeenCalledWith(123);
  });

  it('should update a student', () => {
    controller.update('123', {} as any, { user: { id: 1 } } as any);
    expect(service.update).toHaveBeenCalledWith(123, {}, 1);
  });

  it('should remove a student', () => {
    controller.remove('123', { user: { id: 1 } } as any);
    expect(service.remove).toHaveBeenCalledWith(123, 1);
  });

  it('should inscribe a student', () => {
    controller.inscribe('1', '2', 3);
    expect(service.inscribeStudent).toHaveBeenCalledWith(1, 2, 3);
  });

  it('should uninscribe a student', () => {
    controller.uninscribe('1', '2', 3);
    expect(service.removeInscription).toHaveBeenCalledWith(1, 2, 3);
  });

  it('should get tracking info', async () => {
    await controller.getTrackingInfo('1', '2');
    expect(service.getTrackingBySemester).toHaveBeenCalledWith(1, 2);
  });

  it('should get a commitment by ID', async () => {
    await controller.getCommitmentById('42');
    expect(service.findCommitmentById).toHaveBeenCalledWith(42);
  });

  it('should lock a student', () => {
    controller.lock('123', { user: { id: 456 } } as any);
    expect(service.lock).toHaveBeenCalledWith(123, 456);
  });

  it('should unlock a student', () => {
    controller.unlock('123', { user: { id: 456 } } as any);
    expect(service.unlock).toHaveBeenCalledWith(123, 456);
  });

  it('should confirm commitments', () => {
    controller.confirm('123');
    expect(service.findStudentCommitments).toHaveBeenCalledWith(123);
  });

  it('should get inscriptions', () => {
    controller.getInscriptions('123', '2024');
    expect(service.getInscriptions).toHaveBeenCalledWith(123, 2024);
  });

  it('should update an inscription', () => {
    controller.updateInscription('1', '2', 3);
    expect(service.updateInscription).toHaveBeenCalledWith(1, 2, 3);
  });

  it('should find an inscription by ID', () => {
    controller.findInscriptionById('7');
    expect(service.findInscriptionById).toHaveBeenCalledWith(7);
  });
});
