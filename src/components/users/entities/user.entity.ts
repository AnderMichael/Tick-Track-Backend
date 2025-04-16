export class UserEntity {
    id: number;
    upbCode: number;
    firstName: string;
    secondName: string;
    fatherLastName: string;
    motherLastName: string;
    email: string;
    phone: number;
    createdAt: Date;
    updatedAt: Date;
    is_deleted: boolean;
    is_active: boolean;
    hashed_password: string;
}
