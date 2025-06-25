import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsOptional,
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
  @IsOptional()
  comment_student?: string;

  @IsString()
  @IsNotEmpty()
  comment_administrative: string;

  @IsInt()
  @IsPositive()
  work_id: number;

  @IsInt()
  @IsPositive()
  inscription_id: number;

  @IsInt()
  @IsPositive()
  qualification_id: number;

  @IsInt()
  @IsPositive()
  author_id: number;
}
