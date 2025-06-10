import { IsInt, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateServiceDetailsDto {
  @IsNotEmpty()
  @IsPositive({ message: 'Percentage must be a positive integer' })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'Percentage must be a number with up to 2 decimal places' },
  )
  percentage: number;

  @IsNotEmpty()
  @IsPositive({ message: 'Hours Per Semester must be a positive integer' })
  @IsInt({ message: 'Hours Per Semester must be an integer' })
  hours_per_semester: number;

  @IsNotEmpty()
  @IsPositive({ message: 'Total Hours must be a positive integer' })
  @IsInt({ message: 'Total Hours must be an integer' })
  total_hours: number;
}
