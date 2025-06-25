import { UserModel } from '../../users/models/user.model';

export class AdministrativeModel extends UserModel {
  id: number;
  upbRole: string | null;

  constructor(user: any) {
    super(user);
    this.upbRole = user.administrative?.upb_role || null;
    this.id = user.administrative?.id || null;
  }

  static fromMany(users: any[]): AdministrativeModel[] {
    return users.map((user) => new AdministrativeModel(user));
  }
}
