export class StudentModel {
  id: number;
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
  semester: number | null;

  constructor(user: any) {
    this.id = user.student?.id || null;
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
    this.semester = user.student?.semester;
  }

  static fromMany(users: any[]): StudentModel[] {
    return users.map((user) => new StudentModel(user));
  }
}
