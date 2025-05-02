import { IsString } from 'class-validator';
import { CreateUserDto } from '../../../components/users/dto/create-user.dto';

export class CreateAdministrativeDto extends CreateUserDto {
  @IsString()
  upbRole: string;
}
