import { IsInt, IsPositive, IsString, Min } from 'class-validator';

export class LoginDto {
  @IsInt()
  @Min(1, { message: 'upbCode must be a positive integer' })
  upbCode: number;

  @IsString()
  password: string;
}
