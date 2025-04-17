import { UserModel } from 'src/components/users/models/user.model';

export class AdministrativeModel extends UserModel {
    upbRole: string | null;

    constructor(user: any) {
        super(user);
        this.upbRole = user.administratives?.upbRole || null;
    }

    static fromMany(users: any[]): AdministrativeModel[] {
        return users.map(user => new AdministrativeModel(user));
    }
}
