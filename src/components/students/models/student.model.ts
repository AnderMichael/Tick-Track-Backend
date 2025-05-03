import { UserModel } from '../../users/models/user.model';

export class StudentModel extends UserModel {
  id: number;
  semester: number | null;

  constructor(user: any) {
    super(user);
    this.id = user.student?.id || null;
    this.semester = user.student?.semester || null;
  }

  static fromMany(users: any[]): StudentModel[] {
    return users.map((user) => new StudentModel(user));
  }
}
