import { JWTUtils } from "../utils/JWTUtils";

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
    commitment?: any;
    inscriptions: any[];
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
    if (!!user.students) {
      this.student = {
        semester: user.students.semester,
        commitment: user.students.commitment?.service_details,
        inscriptions: user.students.inscriptions,
        accountKey: JWTAccountKeyUtils.generateAccountKeyToken({
          accountKey: `${user.id}-${user.upbCode}`,
        }),
      };
    }

    if (!!user.administratives) {
      this.administrative = {
        upbRole: user.administratives.upbRole,
      };
    }
  }
}
