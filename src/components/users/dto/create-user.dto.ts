import {
  IsEmail,
  IsInt,
  IsString,
  IsNotEmpty,
  Length,
  Matches,
  Min,
} from 'class-validator';

export class CreateUserDto {
  @IsInt()
  @Min(1, { message: 'upbCode must be a positive integer' })
  upbCode: number;

  @IsString()
  @IsNotEmpty({ message: 'firstName is required' })
  @Length(2, 50, { message: 'firstName must be between 2 and 50 characters' })
  firstName: string;

  @IsString()
  @IsNotEmpty({ message: 'secondName is required' })
  @Length(2, 50, { message: 'secondName must be between 2 and 50 characters' })
  secondName: string;

  @IsString()
  @IsNotEmpty({ message: 'fatherLastName is required' })
  @Length(2, 50, {
    message: 'fatherLastName must be between 2 and 50 characters',
  })
  fatherLastName: string;

  @IsString()
  @IsNotEmpty({ message: 'motherLastName is required' })
  @Length(2, 50, {
    message: 'motherLastName must be between 2 and 50 characters',
  })
  motherLastName: string;

  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @IsString()
  @Matches(/^[0-9]{7,15}$/, {
    message: 'phone must be a valid numeric string between 7 and 15 digits',
  })
  phone: string;

  @IsInt()
  @Min(1, { message: 'department_id must be a positive integer' })
  department_id: number;

  @IsInt()
  @Min(1, { message: 'role_id must be a positive integer' })
  role_id: number;
}
