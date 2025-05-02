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
  upbCode?: number;

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

  buildTransactionWhere() {
    const where: any = {
      is_deleted: false,
    };

    if (this.upbCode) {
      where.student = {
        user: {
          upbCode: this.upbCode,
        },
      };
    }

    if (this.work_id) {
      where.work_id = this.work_id;
    }

    if (this.semester_id) {
      where.work = {
        semester_id: this.semester_id,
      };
    }

    if (this.department_id) {
      where.student = {
        ...(where.student || {}),
        user: {
          ...(where.student?.user || {}),
          department_id: this.department_id,
        },
      };
    }

    return where;
  }
}
