import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class TransactionPaginationDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  semester_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  student_upb_code?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  work_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  department_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  administrative_upb_code?: number;

  buildTransactionWhere() {
    const where: any = {
      is_deleted: false,
    };

    if (this.student_upb_code || this.department_id) {
      where.inscription = {
        ...(where.inscription || {}),
        commitment: {
          student: {
            ...(this.student_upb_code && {
              user: {
                upbCode: this.student_upb_code,
              },
            }),
            ...(this.department_id && {
              user: {
                ...(this.student_upb_code
                  ? { upbCode: this.student_upb_code }
                  : {}),
                department_id: this.department_id,
              },
            }),
          },
        },
      };
    }

    if (this.work_id || this.semester_id || this.administrative_upb_code) {
      where.work = {
        ...(this.work_id && { id: this.work_id }),
        ...(this.semester_id && { semester_id: this.semester_id }),
        ...(this.administrative_upb_code && {
          administrative: {
            user: {
              upbCode: this.administrative_upb_code,
            },
          },
        }),
      };
    }

    return where;
  }
}
