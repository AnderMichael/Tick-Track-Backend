import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ScholarshipsService } from './scholarships.service';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

@Controller('scholarships')
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Post()
  create(@Body() createDto: CreateScholarshipDto) {
    return this.scholarshipsService.create(createDto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.scholarshipsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.scholarshipsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateScholarshipDto) {
    return this.scholarshipsService.update(+id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.scholarshipsService.remove(+id);
  }
}
