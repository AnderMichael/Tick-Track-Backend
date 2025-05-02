import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsPositive,
  IsString,
} from 'class-validator';

export class CreateTransactionDto {
  @IsDateString()
  date: string;

  @IsInt()
  @IsPositive()
  hours: number;

  @IsString()
  @IsNotEmpty()
  comment_student: string;

  @IsString()
  @IsNotEmpty()
  comment_administrative: string;

  @IsInt()
  @IsPositive()
  work_id: number;

  @IsInt()
  @IsPositive()
  student_id: number;
}
