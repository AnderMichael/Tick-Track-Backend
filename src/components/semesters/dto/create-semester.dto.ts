import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateSemesterDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;
}
