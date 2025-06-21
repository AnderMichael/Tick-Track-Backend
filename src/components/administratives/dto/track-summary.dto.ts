import { IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class TrackSummaryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El código UPB debe ser un número entero' })
  @IsPositive({ message: 'El código UPB debe ser un número positivo' })
  upbCode?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'El ID del departamento debe ser un número entero' })
  @IsPositive({ message: 'El ID del departamento debe ser un número positivo' })
  department_id?: number;
}
