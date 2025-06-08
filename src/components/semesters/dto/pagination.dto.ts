import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class SemesterPaginationDto extends PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(2000)
  year?: number;

  buildSemesterWhere() {
    const where: any = { is_deleted: false };

    if (this.year) {
      where.year = this.year;
    }

    return where;
  }
}