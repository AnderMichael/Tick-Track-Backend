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
  role: string;
  department: string;
  departmentId: number;
  isConfirmed: boolean;
  phone: string;
  student?: {
    semester: number;
    inscriptions: { id: number; name: string }[];
    accountKey: string;
  };
  administrative?: {
    upbRole: string;
  };

  constructor(user: User | any) {
    this.upbCode = user.upbCode;
    this.email = user.email;
    this.fullName = `${user.firstName} ${user.fatherLastName}`;
    this.role = user.role?.name;
    this.department = user.department?.name;
    this.isConfirmed = user.is_confirmed;
    this.phone = user.phone;
    this.departmentId = user.department.id;
    
    if (!!user.student) {
      const commitments = user.student?.commitment || [];

      const semesterMap = new Map<number, { id: number; name: string }>();
      commitments.forEach((commit) => {
        commit.inscriptions.forEach((inscription) => {
          const semesterExtended: any = inscription.semester;
          semesterExtended.commitment_id = commit.id;
          semesterExtended.semester_id = semesterExtended.id;
          semesterExtended.id = inscription.id;
          semesterExtended.name = `Semestre ${defineRomanNumbers(semesterExtended.number)} - ${semesterExtended.year}`;
          if (semesterExtended && !semesterMap.has(semesterExtended.id)) {
            semesterMap.set(semesterExtended.id, semesterExtended);
          }
        });
      });
      this.student = {
        semester: user.student.semester,
        inscriptions: Array.from(semesterMap.values()),
        accountKey: JWTAccountKeyUtils.generateAccountKeyToken({
          accountKey: `${user.id}-${user.upbCode}`,
        }),
      };
    }

    if (!!user.administrative) {
      this.administrative = {
        upbRole: user.administrative.upb_role,
      };
    }
  }
}
