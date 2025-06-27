import { Test, TestingModule } from '@nestjs/testing';
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkPaginationDto } from './dto/work.pagination.dto';
import { WorksController } from './works.controller';
import { WorksService } from './works.service';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';

describe('WorksController', () => {
  let controller: WorksController;
  let service: jest.Mocked<WorksService>;

  const mockService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    lock: jest.fn(),
    unlock: jest.fn(),
    remove: jest.fn(),
  };

  const mockUser = { id: 123, upbCode: 456 };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WorksController],
      providers: [
        {
          provide: WorksService,
          useValue: mockService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(UserAvailableGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<WorksController>(WorksController);
    service = module.get(WorksService);
  });

  it('debe llamar a service.create', async () => {
    const dto = {} as CreateWorkDto;
    const req = { user: mockUser } as any;
    await controller.create(dto, req);
    expect(service.create).toHaveBeenCalledWith(dto, mockUser.upbCode);
  });

  it('debe llamar a service.findAll', async () => {
    const pagination = {} as WorkPaginationDto;
    await controller.findAll(pagination);
    expect(service.findAll).toHaveBeenCalledWith(pagination);
  });

  it('debe llamar a service.findOne con ID', async () => {
    await controller.findOne('1');
    expect(service.findOne).toHaveBeenCalledWith(1);
  });

  it('debe llamar a service.update con parámetros correctos', async () => {
    const dto = {} as UpdateWorkDto;
    const req = { user: mockUser } as any;
    await controller.update('1', dto, req);
    expect(service.update).toHaveBeenCalledWith(1, dto, mockUser.id);
  });

  it('debe llamar a service.lock', async () => {
    const req = { user: mockUser } as any;
    await controller.lock('1', req);
    expect(service.lock).toHaveBeenCalledWith(1, mockUser.id);
  });

  it('debe llamar a service.unlock', async () => {
    const req = { user: mockUser } as any;
    await controller.unlock('1', req);
    expect(service.unlock).toHaveBeenCalledWith(1, mockUser.id);
  });

  it('debe llamar a service.remove', async () => {
    const req = { user: mockUser } as any;
    await controller.remove('1', req);
    expect(service.remove).toHaveBeenCalledWith(1, mockUser.id);
  });
});
