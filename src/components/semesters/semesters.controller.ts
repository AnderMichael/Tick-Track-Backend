import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/guards/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { SemestersService } from './semesters.service';

@ApiTags('Semesters')
@Controller('semesters')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SemestersController {
    constructor(private readonly semestersService: SemestersService) { }

    @Post()
    @Permissions('create:semesters')
    @ApiOperation({ summary: 'Create new semester' })
    create(@Body() createSemesterDto: CreateSemesterDto) {
        return this.semestersService.create(createSemesterDto);
    }

    @Get()
    @Permissions('view:semesters')
    @ApiOperation({ summary: 'List semesters with pagination' })
    findAll(@Query() pagination: PaginationDto) {
        return this.semestersService.findAll(pagination);
    }

    @Get(':id')
    @Permissions('view:semesters')
    @ApiOperation({ summary: 'Get one semester by ID' })
    findOne(@Param('id') id: string) {
        return this.semestersService.findOne(+id);
    }

    @Patch(':id')
    @Permissions('update:semesters')
    @ApiOperation({ summary: 'Update a semester by ID' })
    update(@Param('id') id: string, @Body() updateSemesterDto: UpdateSemesterDto) {
        return this.semestersService.update(+id, updateSemesterDto);
    }

    @Delete(':id')
    @Permissions('delete:semesters')
    @ApiOperation({ summary: 'Soft delete a semester by ID' })
    remove(@Param('id') id: string) {
        return this.semestersService.remove(+id);
    }
}
