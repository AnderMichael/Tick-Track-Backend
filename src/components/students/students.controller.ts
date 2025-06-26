import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/guards/decorators/permissions.decorator';
import { AuthenticatedRequest, JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { StudentPaginationDto } from '../common/dto/user.pagination.dto';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { StudentsService } from './students.service';

@ApiTags('Students')
@Controller('students')
@UseGuards(JwtAuthGuard, UserAvailableGuard, PermissionsGuard)
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  @Permissions('create:students')
  @ApiOperation({ summary: 'Create new student' })
  create(
    @Body() createDto: CreateStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.studentsService.create(createDto, administrative_id);
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
  update(
    @Param('upbCode') upbCode: string,
    @Body() updateDto: UpdateStudentDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.studentsService.update(+upbCode, updateDto, administrative_id);
  }

  @Delete(':upbCode')
  @Permissions('delete:students')
  @ApiOperation({ summary: 'Soft delete a student by upbCode' })
  remove(
    @Param('upbCode') upbCode: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.studentsService.remove(+upbCode, administrative_id);
  }

  @Post(':upbCode/inscribe/:semesterId')
  @Permissions('update:students')
  @ApiOperation({ summary: 'Inscribe a student to a semester' })
  inscribe(
    @Param('upbCode') upbCode: string,
    @Param('semesterId') semesterId: string,
    @Body('commitment_id') commitment_id: number,
  ) {
    return this.studentsService.inscribeStudent(
      +upbCode,
      +semesterId,
      commitment_id,
    );
  }

  @Patch(':upbCode/uninscribe/:semesterId')
  @Permissions('update:students')
  @ApiOperation({ summary: 'Remove a student inscription from a semester' })
  uninscribe(
    @Param('upbCode') upbCode: string,
    @Param('semesterId') semesterId: string,
    @Body('commitment_id') commitment_id: number,
  ) {
    return this.studentsService.removeInscription(
      +upbCode,
      +semesterId,
      commitment_id,
    );
  }

  @Get(':upbCode/tracks/:semesterId')
  @Permissions('view:tracks')
  @ApiOperation({ summary: 'Obtain Tracking Info Hours' })
  async getTrackingInfo(
    @Param('upbCode') upbCode: string,
    @Param('semesterId') semesterId: string,
  ) {
    return this.studentsService.getTrackingBySemester(+upbCode, +semesterId);
  }

  @Get('commitments/:commitmentId')
  @Permissions('view:commitments')
  async getCommitmentById(@Param('commitmentId') commitmentId: string) {
    return this.studentsService.findCommitmentById(+commitmentId);
  }

  @Patch(':upbCode/lock')
  @Permissions('update:students')
  @ApiOperation({ summary: 'Lock a student by upbCode' })
  lock(@Param('upbCode') upbCode: string, @Req() request: AuthenticatedRequest) {
    const { id: administrative_id } = request.user;
    return this.studentsService.lock(+upbCode, administrative_id);
  }

  @Patch(':upbCode/unlock')
  @Permissions('update:students')
  @ApiOperation({ summary: 'Unlock a student by upbCode' })
  unlock(@Param('upbCode') upbCode: string, @Req() request: AuthenticatedRequest) {
    const { id: administrative_id } = request.user;
    return this.studentsService.unlock(+upbCode, administrative_id);
  }

  @Get(':upbCode/commitments')
  @Permissions('update:students')
  @ApiOperation({ summary: 'Confirm a student by upbCode' })
  confirm(@Param('upbCode') upbCode: string) {
    return this.studentsService.findStudentCommitments(+upbCode);
  }

  @Get(':upbCode/inscriptions')
  @Permissions('view:students')
  @ApiOperation({ summary: 'Get all inscriptions of a student by upbCode' })
  getInscriptions(
    @Param('upbCode') upbCode: string,
    @Query('year') year: string,
  ) {
    return this.studentsService.getInscriptions(+upbCode, Number(year));
  }

  @Patch(':upbCode/inscriptions/:inscriptionId')
  @Permissions('update:students')
  @ApiOperation({
    summary: 'Update a student inscription by upbCode and inscriptionId',
  })
  updateInscription(
    @Param('upbCode') upbCode: string,
    @Param('inscriptionId') inscriptionId: string,
    @Body('commitment_id') commitment_id: number,
  ) {
    return this.studentsService.updateInscription(
      +upbCode,
      +inscriptionId,
      commitment_id,
    );
  }

  @Get(':upbCode/inscriptions/:inscriptionId')
  @Permissions('view:students')
  @ApiOperation({
    summary: 'Get a student inscription by upbCode and inscriptionId',
  })
  findInscriptionById(@Param('inscriptionId') inscriptionId: string) {
    return this.studentsService.findInscriptionById(+inscriptionId);
  }
}
