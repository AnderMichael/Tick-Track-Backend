import { Type } from "class-transformer";
import { IsBoolean, IsInt, IsOptional, IsPositive } from "class-validator";
import { PaginationDto } from "./pagination.dto";

export class UserPaginationDto extends PaginationDto {
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isAvailable?: boolean;

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    isConfirmed?: boolean;

    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    department_id?: string;

    override buildBaseWhere() {
        const where = super.buildBaseWhere();

        if (this.isAvailable !== undefined) {
            where.isAvailable = this.isAvailable;
        }

        if (this.isConfirmed !== undefined) {
            where.is_confirmed = this.isConfirmed;
        }

        if (this.department_id !== undefined) {
            where.department_id = Number(this.department_id);
        }

        return where;
    }
}

export class StudentPaginationDto extends UserPaginationDto {
    buildWhere() {
        return {
            ...this.buildBaseWhere(),
            students: { isNot: null },
        };
    }
}

export class AdministrativePaginationDto extends UserPaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    role_id?: string;

    buildWhere() {
        const where = {
            ...this.buildBaseWhere(),
            administratives: { isNot: null },
        };

        if (this.role_id !== undefined) {
            where.role_id = Number(this.role_id);
        }

        return where;
    }
}