import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateSemesterDto {
  @IsNotEmpty()
  @IsInt()
  number: number;

  @IsNotEmpty()
  @IsInt()
  year: number;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;
}
