import { PaginationDto } from "../dto/pagination.dto";

export class PaginationFilterBuilder {
    private page: number;
    private limit: number;
    private search?: string | number;
    private skip: number;

    constructor(pagination: PaginationDto) {
        this.page = pagination.page || 1;
        this.limit = pagination.limit || 10;
        this.search = pagination.search;
        this.skip = (this.page - 1) * this.limit;
    }

    
}