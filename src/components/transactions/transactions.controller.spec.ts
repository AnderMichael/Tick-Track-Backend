import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransactionPaginationDto } from './dto/transaction.pagination.dto';
import { TransactionsController } from './transactions.controller';
import { TransactionsService } from './transactions.service';

describe('TransactionsController', () => {
  let controller: TransactionsController;
  let service: jest.Mocked<TransactionsService>;

  const mockService: Partial<Record<keyof TransactionsService, jest.Mock>> = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    addStudentComment: jest.fn(),
    getStudentHeaderInfo: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionsController],
      providers: [{ provide: TransactionsService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(PermissionsGuard)
      .useValue({ canActivate: () => true })
      .overrideGuard(UserAvailableGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TransactionsController>(TransactionsController);
    service = module.get(
      TransactionsService,
    ) as jest.Mocked<TransactionsService>;
  });

  it('should call service.create', async () => {
    const dto = {} as CreateTransactionDto;
    await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('should call service.findAll', async () => {
    const pagination = { page: 1, limit: 10 } as TransactionPaginationDto;
    await controller.findAll(pagination);
    expect(service.findAll).toHaveBeenCalledWith(pagination);
  });

  it('should call service.findOne with correct id', async () => {
    await controller.findOne('5');
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('should call service.remove with correct id', async () => {
    await controller.remove('5');
    expect(service.remove).toHaveBeenCalledWith(5);
  });

  it('should call service.addStudentComment with correct params', async () => {
    const req = { user: { upbCode: 123 } } as any;
    await controller.addStudentComment('10', 'comentario', req);
    expect(service.addStudentComment).toHaveBeenCalledWith(
      10,
      'comentario',
      123,
    );
  });

  it('should call getStudentHeaderInfo with correct params', async () => {
    const req = {
      student: { upbCode: 123 },
      user: { department_id: 1, role_id: 2 },
    } as any;
    await controller.getStudentFromToken('4', req);
    expect(service.getStudentHeaderInfo).toHaveBeenCalledWith(123, 1, 2, 4);
  });
});
