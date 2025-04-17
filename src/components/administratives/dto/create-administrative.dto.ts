import { IsBoolean, IsString } from "class-validator";
import { CreateUserDto } from "src/components/users/dto/create-user.dto";

export class CreateAdministrativeDto extends CreateUserDto {
    @IsString()
    upbRole: string;
}
