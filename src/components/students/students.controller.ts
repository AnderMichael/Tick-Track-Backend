import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly service: StudentsService) { }

  @Post()
  create(@Body() dto: CreateStudentDto) {
    return this.service.create(dto);
  }

  @Get()
  findAll(@Query() pagination: PaginationDto) {
    return this.service.findAll(pagination);
  }

  @Get(':upbCode')
  findOne(@Param('upbCode', ParseIntPipe) upbCode: number) {
    return this.service.findOne(upbCode);
  }

  @Patch(':upbCode')
  update(
    @Param('upbCode', ParseIntPipe) upbCode: number,
    @Body() dto: UpdateStudentDto,
  ) {
    return this.service.update(upbCode, dto);
  }

  @Delete(':upbCode')
  remove(@Param('upbCode', ParseIntPipe) upbCode: number) {
    return this.service.remove(upbCode);
  }
}
