import { Prisma } from '@prisma/client';
import defineRomanNumbers from '../../../components/common/helpers/defineRomanNumbers';
import { JWTUtils } from '../utils/JWTUtils';

const userWithRelations = Prisma.validator<Prisma.userDefaultArgs>()({
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
                    number: true,
                    year: true,
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
              },
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
                },
              },
            },
          },
        },
      },
    },
    administrative: true,
  },
});

type User = Prisma.userGetPayload<typeof userWithRelations>;

const JWTAccountKeyUtils = new JWTUtils();
export class UserModel {
  upbCode: number;
  email: string;
  fullName: string;
  fatherLastName?: string;
  motherLastName?: string;
  secondName?: string;
  firstName?: string;
  role: string;
  role_id?: number;
  department: string;
  department_id: number;
  isConfirmed: boolean;
  isAvailable?: boolean;
  phone: string;
  student?: {
    semester: number;
    inscriptions: { id: number; name: string }[];
    accountKey: string;
  };
  administrative?: {
    upbRole: string;
    utils: {
      studentRoleId: number;
      supervisorRoleId: number;
      scholarshipOfficerRoleId: number;
      departments: { id: number; value: string }[];
      qualifications: { id: number; value: string }[];
    };
  };

  constructor(user: User | any) {
    this.upbCode = user.upbCode;
    this.email = user.email;
    this.fullName = `${user.firstName} ${user.fatherLastName}`;
    this.fatherLastName = user.fatherLastName;
    this.motherLastName = user.motherLastName;
    this.secondName = user.secondName;
    this.firstName = user.firstName;
    this.role = user.role?.name;
    this.role_id = user.role?.id;
    this.department = user.department?.name;
    this.isConfirmed = user.is_confirmed;
    this.phone = user.phone;
    this.department_id = user.department.id;
    this.isAvailable = user.isAvailable;
    if (!!user.student) {
      const commitments = user.student?.commitment || [];

      const semesterMap = new Map<number, any>();

      commitments.forEach((commit) => {
        commit.inscriptions.forEach((inscription) => {
          const semesterExtended: any = inscription.semester;
          semesterExtended.commitment_id = commit.id;
          semesterExtended.semester_id = semesterExtended.id;
          semesterExtended.id = inscription.id;
          semesterExtended.name = `Semestre ${defineRomanNumbers(semesterExtended.number)} - ${semesterExtended.year}`;
          semesterExtended.is_complete = inscription.is_complete;
          if (semesterExtended && !semesterMap.has(semesterExtended.id)) {
            semesterMap.set(semesterExtended.id, semesterExtended);
          }
        });
      });

      this.student = {
        semester: user.student.semester,
        inscriptions: Array.from(semesterMap.values()).sort((a, b) => {
          if (b.year !== a.year) return b.year - a.year;
          return b.number - a.number;
        }),
        accountKey: JWTAccountKeyUtils.generateAccountKeyToken({
          accountKey: `${user.id}-${user.upbCode}`,
        }),
      };
    }

    if (!!user.administrative) {
      this.administrative = {
        upbRole: user.administrative.upb_role,
        utils: {
          studentRoleId: user.studentRoleId,
          supervisorRoleId: user.supervisorRoleId,
          scholarshipOfficerRoleId: user.scholarshipOfficerRoleId,
          departments: user.departments,
          qualifications: user.qualifications,
        },
      };
    }
  }
}
