import { UserModel } from 'src/components/users/models/user.model';

export class StudentModel extends UserModel {
    semester: number | null;

    constructor(user: any) {
        super(user);
        this.semester = user.students?.semester || null;
    }

    static fromMany(users: any[]): StudentModel[] {
        return users.map(user => new StudentModel(user));
    }
}
