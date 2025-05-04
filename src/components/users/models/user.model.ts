import { JWTUtils } from '../utils/JWTUtils';

const JWTAccountKeyUtils = new JWTUtils();
export class UserModel {
  upbCode: number;
  email: string;
  fullName: string;
  role: string;
  department: string;
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

  constructor(user: any) {
    this.upbCode = user.upbCode;
    this.email = user.email;
    this.fullName = `${user.firstName} ${user.fatherLastName}`;
    this.role = user.role?.name;
    this.department = user.department?.name;
    this.isConfirmed = user.is_confirmed;
    this.phone = user.phone;
    if (!!user.student) {
      const commitments = user.student?.commitment || [];

      const semesterMap = new Map<number, { id: number; name: string }>();
      commitments.forEach((commit) => {
        commit.inscriptions?.forEach((i) => {
          const sem = i.semester;
          sem.commitment_id = commit.id;
          sem.semester_id = sem.id;
          sem.id = i.id;
          if (sem && !semesterMap.has(sem.id)) {
            semesterMap.set(sem.id, sem);
          }
        });
      });
      this.student = {
        semester: user.student.semester,
        inscriptions: Array.from(semesterMap.values()),
        accountKey: JWTAccountKeyUtils.generateAccountKeyToken({ accountKey: `${user.id}-${user.upbCode}` }),
      };
    }

    if (!!user.administrative) {
      this.administrative = {
        upbRole: user.administrative.upb_role,
      };
    }
  }
}
