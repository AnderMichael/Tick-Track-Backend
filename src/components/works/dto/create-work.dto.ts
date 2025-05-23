import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateWorkDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsDateString()
  date_begin: string;

  @IsNotEmpty()
  @IsDateString()
  date_end: string;

  @IsInt()
  @IsPositive()
  semester_id: number;
}
