import { UserRepository } from './user.repository';

jest.mock('../../config/prisma.client', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findFirst: jest.fn(),
    },
    department: {
      findMany: jest.fn(),
    },
    qualification: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock('./utils/bcrypt', () => {
  return {
    BcryptUtils: jest.fn().mockImplementation(() => ({
      hashPassword: jest.fn().mockResolvedValue('hashedPassword'),
      getDefaultPassword: jest.fn().mockResolvedValue('defaultHashed'),
    })),
  };
});

import { prisma } from '../../config/prisma.client';

describe('UserRepository', () => {
  let repository: UserRepository;

  beforeEach(() => {
    repository = new UserRepository();
  });

  it('checkAvailability: should return true if user is available', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const result = await repository.checkAvailability(123);
    expect(result).toBe(true);
  });

  it('checkAvailability: should return false if user not found', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce(null);
    const result = await repository.checkAvailability(123);
    expect(result).toBe(false);
  });

  it('findByUpbCode: should call prisma with correct include', async () => {
    await repository.findByUpbCode(456);
    expect(prisma.user.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { upbCode: 456 },
      }),
    );
  });

  it('findUserDetails: should return user with nested relations', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const result = await repository.findUserDetails({ upbCode: 123 } as any);
    expect(result).toEqual({ id: 1 });
  });

  it('updatePassword: should update user password', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const bcrypt = (repository as any).bcryptUtils;
    await repository.updatePassword(123, 'newpass');
    expect(bcrypt.hashPassword).toHaveBeenCalledWith('newpass');
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { hashed_password: 'hashedPassword', is_confirmed: true },
    });
  });

  it('resetPassword: should reset password with default', async () => {
    (prisma.user.findFirst as jest.Mock).mockResolvedValueOnce({ id: 1 });
    const bcrypt = (repository as any).bcryptUtils;
    await repository.resetPassword(123);
    expect(bcrypt.getDefaultPassword).toHaveBeenCalled();
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { hashed_password: 'defaultHashed', is_confirmed: false },
    });
  });

  it('getUserUtils: should return role IDs and mapped departments/qualifications', async () => {
    (prisma.role.findFirst as jest.Mock)
      .mockResolvedValueOnce({ id: 1 }) // student
      .mockResolvedValueOnce({ id: 2 }) // supervisor
      .mockResolvedValueOnce({ id: 3 }); // scholarship

    (prisma.department.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 10, name: 'Dept A' },
    ]);

    (prisma.qualification.findMany as jest.Mock).mockResolvedValueOnce([
      { id: 20, name: 'Qual A' },
    ]);

    const result = await repository.getUserUtils();

    expect(result).toEqual({
      studentRoleId: 1,
      supervisorRoleId: 2,
      scholarshipOfficerRoleId: 3,
      departments: [{ id: 10, value: 'Dept A' }],
      qualifications: [{ id: 20, value: 'Qual A' }],
    });
  });

  it('addRefreshToken: should create a new refresh token and return it', async () => {
    const mockToken = { token: 'refresh-token-123' };
    prisma.refresh_token = {
      create: jest.fn().mockResolvedValueOnce(mockToken),
    } as any;

    const result = await repository.addRefreshToken(
      1,
      'refresh-token-123',
      10000,
    );
    expect(prisma.refresh_token.create).toHaveBeenCalledWith({
      data: {
        user_id: 1,
        token: 'refresh-token-123',
        expires_at: expect.any(Date),
      },
    });
    expect(result).toBe('refresh-token-123');
  });

  it('getRefreshToken: should return token if it is valid and not expired', async () => {
    const futureDate = new Date(Date.now() + 60000);
    prisma.refresh_token = {
      findFirst: jest
        .fn()
        .mockResolvedValueOnce({
          token: 'valid-token',
          expires_at: futureDate,
        }),
    } as any;

    const result = await repository.getRefreshToken(1);
    expect(prisma.refresh_token.findFirst).toHaveBeenCalledWith({
      where: { user_id: 1 },
      orderBy: { expires_at: 'desc' },
    });
    expect(result).toBe('valid-token');
  });

  it('getRefreshToken: should return null if no token is found', async () => {
    prisma.refresh_token = {
      findFirst: jest.fn().mockResolvedValueOnce(null),
    } as any;

    const result = await repository.getRefreshToken(1);
    expect(result).toBeNull();
  });

  it('getRefreshToken: should return null if token is expired', async () => {
    const pastDate = new Date(Date.now() - 60000);
    prisma.refresh_token = {
      findFirst: jest
        .fn()
        .mockResolvedValueOnce({
          token: 'expired-token',
          expires_at: pastDate,
        }),
    } as any;

    const result = await repository.getRefreshToken(1);
    expect(result).toBeNull();
  });
});
