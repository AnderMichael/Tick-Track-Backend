import { IsNotEmpty, IsString } from 'class-validator';
import { Match } from '../../common/decorators/match.decorator';

export class ConfirmDto {
  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  @Match('password', { message: 'Passwords do not match' })
  confirmPassword: string;
}
