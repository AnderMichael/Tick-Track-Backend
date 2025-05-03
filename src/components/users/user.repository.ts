import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from '../../config/prisma.client';
import { UserInfo } from '../auth/models/UserInfo';
import { BcryptUtils } from './utils/bcrypt';

@Injectable()
export class UserRepository {
  private prisma: CustomPrismaClientType;
  private bcryptUtils: BcryptUtils;

  constructor() {
    this.prisma = prisma;
    this.bcryptUtils = new BcryptUtils();
  }

  async checkAvailability(upbCode: number) {
    const user = await this.prisma.user.findFirst({
      where: {
        upbCode: upbCode,
        isAvailable: true,
      },
    });
    return user ? true : false;
  }

  async findByUpbCode(upbCode: number) {
    return await this.prisma.user.findFirst({
      where: {
        upbCode: upbCode,
      },
      include: {
        role: {
          include: {
            role_permission: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });
  }

  async findUserDetails(payload: UserInfo) {
    const user = await this.prisma.user.findFirst({
      where: { upbCode: payload.upbCode },
      include: {
        role: true,
        department: true,
        student: {
          include: {
            commitment: {
              where: {
                is_deleted: false,
              },
              select: {
                inscriptions: {
                  select: {
                    id: true,
                    semester: {
                      select: {
                        id: true,
                        name: true,
                        start_date: true,
                        end_date: true,
                      },
                    },
                  },
                  where: {
                    is_deleted: false,
                  },
                  orderBy: {
                    semester: {
                      start_date: 'desc',
                    },
                  }
                },
                id: true,
                is_current: true,
                service_details: {
                  select: {
                    percentage: true,
                    hours_per_semester: true,
                    scholarship: {
                      select: {
                        name: true,
                        description: true,
                      },
                    }
                  }
                }
              }
            },
          },
        },
        administrative: true,
      },
    });
    return user;
  }

  async updatePassword(upbCode: number, password: string) {
    const user = await this.prisma.user.findFirst({
      where: { upbCode: upbCode },
    });

    const hashedPassword = await this.bcryptUtils.hashPassword(password);
    await this.prisma.user.update({
      where: { id: user?.id },
      data: { hashed_password: hashedPassword, is_confirmed: true },
    });
  }

  async resetPassword(upbCode: number) {
    const user = await this.prisma.user.findFirst({
      where: { upbCode: upbCode },
    });

    const hashedPassword = await this.bcryptUtils.getDefaultPassword();
    await this.prisma.user.update({
      where: { id: user?.id },
      data: { hashed_password: hashedPassword, is_confirmed: false },
    });
  }
}
