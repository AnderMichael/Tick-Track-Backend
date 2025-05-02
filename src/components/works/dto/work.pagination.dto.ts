import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class WorkPaginationDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  semester_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  administrative_id?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  department_id?: number;

  buildWorkWhere() {
    const where: any = {
      is_deleted: false,
    };

    if (this.semester_id) {
      where.semester_id = this.semester_id;
    }

    if (this.administrative_id) {
      where.administrative_id = this.administrative_id;
    }

    if (this.department_id) {
      where.administrative = {
        user: {
          department_id: this.department_id,
        },
      };
    }

    return where;
  }
}
