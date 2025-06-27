import { NotAcceptableException } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let repository: jest.Mocked<UserRepository>;

  const mockRepo = {
    findByUpbCode: jest.fn(),
    findUserDetails: jest.fn(),
    getUserUtils: jest.fn(),
    checkAvailability: jest.fn(),
    updatePassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  beforeEach(() => {
    repository = mockRepo as any;
    service = new UserService(repository);
    jest.clearAllMocks();
  });

  it('findAuthorizationByUpbCode: debe retornar el usuario por código', async () => {
    const user = { id: 1 };
    repository.findByUpbCode.mockResolvedValue(user as any);
    const result = await service.findAuthorizationByUpbCode(123);
    expect(result).toBe(user);
    expect(repository.findByUpbCode).toHaveBeenCalledWith(123);
  });

  it('getBasicUserInfo: debe retornar user model combinado con utilidades', async () => {
  repository.findUserDetails.mockResolvedValue({
    id: 1,
    upbCode: 123,
    email: 'test@example.com',
    firstName: 'Juan',
    fatherLastName: 'Pérez',
    motherLastName: 'Gómez',
    secondName: 'Carlos',
    role: { id: 2, name: 'Student' },
    department: { id: 3, name: 'Ingeniería' },
    is_confirmed: true,
    phone: '123456789',
    isAvailable: true,
    student: {
      commitment: [],
    },
    administrative: {
      upb_role: 'Admin',
    },
  } as any);

  repository.getUserUtils.mockResolvedValue({
    studentRoleId: 1,
    supervisorRoleId: 2,
    scholarshipOfficerRoleId: 3,
    departments: [{ id: 1, value: 'Dep 1' }],
    qualifications: [{ id: 1, value: 'Qual 1' }],
  });

  const result = await service.getBasicUserInfo({ upbCode: 123 } as any);
  expect(result.fullName).toBe('Juan Pérez');
  expect(result.department_id).toBe(3);
  expect(result.administrative?.utils.studentRoleId).toBe(1);
});

  it('checkAvailability: debe retornar true o false', async () => {
    repository.checkAvailability.mockResolvedValue(true);
    const result = await service.checkAvailability(456);
    expect(result).toBe(true);
  });

  it('confirmPassword: debe lanzar error si ya está confirmado', async () => {
    repository.findByUpbCode.mockResolvedValue({ is_confirmed: true } as any);
    await expect(service.confirmPassword(123, 'abc')).rejects.toThrow(
      NotAcceptableException,
    );
  });

  it('confirmPassword: debe llamar a updatePassword si no está confirmado', async () => {
    repository.findByUpbCode.mockResolvedValue({ is_confirmed: false } as any);
    await service.confirmPassword(123, 'abc');
    expect(repository.updatePassword).toHaveBeenCalledWith(123, 'abc');
  });

  it('resetPassword: debe delegar a repository', async () => {
    await service.resetPassword(999);
    expect(repository.resetPassword).toHaveBeenCalledWith(999);
  });
});
