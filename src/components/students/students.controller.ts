import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/guards/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { StudentPaginationDto } from '../common/dto/user.pagination.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) { }

  @Post()
  @Permissions('create:students')
  @ApiOperation({ summary: 'Create new student' })
  create(@Body() createDto: CreateStudentDto) {
    return this.studentsService.create(createDto);
  }

  @Get()
  @Permissions('view:students')
  @ApiOperation({ summary: 'List students with pagination' })
  findAll(@Query() pagination: StudentPaginationDto) {
    return this.studentsService.findAll(pagination);
  }

  @Get(':upbCode')
  @Permissions('view:students')
  @ApiOperation({ summary: 'Get one student by upbCode' })
  findOne(@Param('upbCode') upbCode: string) {
    return this.studentsService.findOne(+upbCode);
  }

  @Patch(':upbCode')
  @Permissions('update:students')
  @ApiOperation({ summary: 'Update a student by upbCode' })
  update(@Param('upbCode') upbCode: string, @Body() updateDto: UpdateStudentDto) {
    return this.studentsService.update(+upbCode, updateDto);
  }

  @Delete(':upbCode')
  @Permissions('delete:students')
  @ApiOperation({ summary: 'Soft delete a student by upbCode' })
  remove(@Param('upbCode') upbCode: string) {
    return this.studentsService.remove(+upbCode);
  }
}
