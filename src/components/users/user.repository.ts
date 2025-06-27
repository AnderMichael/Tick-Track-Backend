import { Injectable } from '@nestjs/common';
import { CustomPrismaClientType, prisma } from '../../config/prisma.client';
import { RoleEnum } from '../../constants/role.enum';
import { UserInfo } from '../auth/models/UserInfo';
import { BcryptUtils } from './utils/bcrypt';
import e from 'express';

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
      where: {
        upbCode: payload.upbCode,
        is_deleted: false,
      },
      include: {
        role: true,
        department: true,
        student: {
          include: {
            commitment: {
              where: {
                is_deleted: false,
              },
              include: {
                inscriptions: {
                  where: {
                    is_deleted: false,
                  },
                  include: {
                    semester: true,
                  },
                  orderBy: { semester: { end_date: 'desc' } },
                },
                service_details: true
              },
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

  async getUserUtils() {
    const studentRoleId = await this.prisma.role.findFirst({
      where: { name: RoleEnum.STUDENT },
      select: { id: true },
    });

    const supervisorRoleId = await this.prisma.role.findFirst({
      where: { name: RoleEnum.SUPERVISOR },
      select: { id: true },
    });

    const scholarshipOfficerRoleId = await this.prisma.role.findFirst({
      where: { name: RoleEnum.SCHOLARSHIP_OFFICER },
      select: { id: true },
    });

    const departments = await this.prisma.department.findMany({
      select: { id: true, name: true },
    });

    const qualifications = await this.prisma.qualification.findMany({
      select: { id: true, name: true },
    });

    return {
      studentRoleId: studentRoleId?.id,
      supervisorRoleId: supervisorRoleId?.id,
      scholarshipOfficerRoleId: scholarshipOfficerRoleId?.id,
      departments: departments.map((department) => ({
        id: department.id,
        value: department.name,
      })),
      qualifications: qualifications.map((qualification) => ({
        id: qualification.id,
        value: qualification.name,
      })),
    };
  }

  async addRefreshToken(userId: number, refreshToken: string, expiresIn: number) {
    await this.prisma.refresh_token.create({
      data: {
        user_id: userId,
        token: refreshToken,
        expires_at: new Date(Date.now() + expiresIn),
      },
    });
  }
}
