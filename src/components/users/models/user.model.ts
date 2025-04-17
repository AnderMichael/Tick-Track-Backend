export class UserModel {
    id: number;
    firstName: string;
    secondName: string;
    fatherLastName: string;
    motherLastName: string;
    email: string;
    isAvailable: boolean;
    upbCode: number;
    is_deleted: boolean;
    is_confirmed: boolean;
    phone: string;
    role: string | null;
    department: string | null;
  
    constructor(user: any) {
      this.id = user.id;
      this.firstName = user.firstName;
      this.secondName = user.secondName;
      this.fatherLastName = user.fatherLastName;
      this.motherLastName = user.motherLastName;
      this.email = user.email;
      this.isAvailable = user.isAvailable;
      this.upbCode = user.upbCode;
      this.is_deleted = user.is_deleted;
      this.is_confirmed = user.is_confirmed;
      this.phone = user.phone;
  
      this.role = user.role?.name || null;
      this.department = user.department?.name || null;
    }
  }
  