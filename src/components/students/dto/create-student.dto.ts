import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { CreateUserDto } from '../../../components/users/dto/create-user.dto';

export class CreateStudentDto extends CreateUserDto {
  @IsInt()
  semester: number;

  @IsOptional()
  @IsBoolean()
  is_deleted: boolean;
}
