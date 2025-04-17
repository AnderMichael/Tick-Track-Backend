import { IsBoolean, IsInt, IsOptional, IsPositive, Min } from "class-validator";
import { PaginationDto } from "./pagination.dto";
import { Type } from "class-transformer";

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
}

export class StudentPaginationDto extends UserPaginationDto { }

export class AdministrativePaginationDto extends UserPaginationDto {
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @IsPositive()
    role_id?: string;
}