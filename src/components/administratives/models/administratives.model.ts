import { UserModel } from '../../users/models/user.model';

export class AdministrativeModel extends UserModel {
    upbRole: string | null;

    constructor(user: any) {
        super(user);
        this.upbRole = user.administratives?.upb_role || null;
    }

    static fromMany(users: any[]): AdministrativeModel[] {
        return users.map(user => new AdministrativeModel(user));
    }
}
