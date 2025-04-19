import { IsNotEmpty, IsString } from 'class-validator';

export class CreateScholarshipDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;
}