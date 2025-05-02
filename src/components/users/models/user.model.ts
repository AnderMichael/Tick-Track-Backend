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
    if (!!user.student) {
      this.student = {
        semester: user.student.semester,
        commitment: user.student.commitment.map(comm => ({ id: comm.service_details_id, is_current: comm.is_current })),
        inscriptions: user.student.inscription,
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
