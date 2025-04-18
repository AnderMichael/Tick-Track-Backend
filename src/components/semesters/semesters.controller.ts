// src/components/semesters/semesters.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateSemesterDto } from './dto/create-semester.dto';
import { UpdateSemesterDto } from './dto/update-semester.dto';
import { SemestersService } from './semesters.service';

@Controller('semesters')
export class SemestersController {
    constructor(private readonly semestersService: SemestersService) { }

    @Post()
    create(@Body() createSemesterDto: CreateSemesterDto) {
        return this.semestersService.create(createSemesterDto);
    }

    @Get()
    findAll(@Query() pagination: PaginationDto) {
        return this.semestersService.findAll(pagination);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.semestersService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateSemesterDto: UpdateSemesterDto) {
        return this.semestersService.update(+id, updateSemesterDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.semestersService.remove(+id);
    }
}
