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
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/guards/decorators/permissions.decorator';
import {
  AuthenticatedRequest,
  JwtAuthGuard,
} from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { AdministrativePaginationDto } from '../common/dto/user.pagination.dto';
import { AdministrativesService } from './administratives.service';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { TrackSummaryDto } from './dto/track-summary.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';

@ApiTags('Administratives')
@Controller('administratives')
@UseGuards(JwtAuthGuard, UserAvailableGuard, PermissionsGuard)
export class AdministrativesController {
  constructor(
    private readonly administrativesService: AdministrativesService,
  ) {}

  @Post('scholarship-officers')
  @Permissions('create:scholarship_officers')
  @ApiOperation({ summary: 'Create new Scholarship Officer' })
  createScholarshipOfficer(
    @Body() createDto: CreateAdministrativeDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.create(createDto, administrative_id);
  }

  @Get('scholarship-officers')
  @Permissions('view:scholarship_officers')
  @ApiOperation({ summary: 'List Scholarship Officers with pagination' })
  findAllScholarshipOfficers(@Query() pagination: AdministrativePaginationDto) {
    return this.administrativesService.findByRole(
      'SCHOLARSHIP_OFFICER',
      pagination,
    );
  }

  @Get('scholarship-officers/:upbCode')
  @Permissions('view:scholarship_officers')
  @ApiOperation({ summary: 'Get one Scholarship Officer by upbCode' })
  findOneScholarshipOfficer(@Param('upbCode') upbCode: string) {
    return this.administrativesService.findOne(+upbCode);
  }

  @Patch('scholarship-officers/:upbCode')
  @Permissions('update:scholarship_officers')
  @ApiOperation({ summary: 'Update a Scholarship Officer by upbCode' })
  updateScholarshipOfficer(
    @Param('upbCode') upbCode: string,
    @Body() updateDto: UpdateAdministrativeDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.update(
      +upbCode,
      updateDto,
      administrative_id,
    );
  }

  @Delete('scholarship-officers/:upbCode')
  @Permissions('delete:scholarship_officers')
  @ApiOperation({ summary: 'Delete a Scholarship Officer by upbCode' })
  removeScholarshipOfficer(
    @Param('upbCode') upbCode: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.remove(+upbCode, administrative_id);
  }

  @Post('supervisors')
  @Permissions('create:supervisors')
  @ApiOperation({ summary: 'Create new Supervisor' })
  createSupervisor(
    @Body() createDto: CreateAdministrativeDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.create(createDto, administrative_id);
  }

  @Get('supervisors')
  @Permissions('view:supervisors')
  @ApiOperation({ summary: 'List Supervisors with pagination' })
  findAllSupervisors(@Query() pagination: AdministrativePaginationDto) {
    return this.administrativesService.findByRole('SUPERVISOR', pagination);
  }

  @Get('supervisors/:upbCode')
  @Permissions('view:supervisors')
  @ApiOperation({ summary: 'Get one Supervisor by upbCode' })
  findOneSupervisor(@Param('upbCode') upbCode: string) {
    return this.administrativesService.findOne(+upbCode);
  }

  @Patch('supervisors/:upbCode')
  @Permissions('update:supervisors')
  @ApiOperation({ summary: 'Update a Supervisor by upbCode' })
  updateSupervisor(
    @Param('upbCode') upbCode: string,
    @Body() updateDto: UpdateAdministrativeDto,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.update(
      +upbCode,
      updateDto,
      administrative_id,
    );
  }

  @Patch('supervisors/:upbCode/lock')
  @Permissions('update:supervisors')
  @ApiOperation({ summary: 'Lock a Supervisor by upbCode' })
  lockSupervisor(
    @Param('upbCode') upbCode: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.lock(+upbCode, administrative_id);
  }

  @Patch('supervisors/:upbCode/unlock')
  @Permissions('update:supervisors')
  @ApiOperation({ summary: 'Unlock a Supervisor by upbCode' })
  unlockSupervisor(
    @Param('upbCode') upbCode: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.unlock(+upbCode, administrative_id);
  }

  @Delete('supervisors/:upbCode')
  @Permissions('delete:supervisors')
  @ApiOperation({ summary: 'Delete a Supervisor by upbCode' })
  removeSupervisor(
    @Param('upbCode') upbCode: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.remove(+upbCode, administrative_id);
  }

  @Patch('scholarship-officers/:upbCode/unlock')
  @Permissions('update:scholarship_officers')
  @ApiOperation({ summary: 'Unlock a Scholarship Officer by upbCode' })
  unlockScholarshipOfficer(
    @Param('upbCode') upbCode: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.unlock(+upbCode, administrative_id);
  }

  @Patch('scholarship-officers/:upbCode/lock')
  @Permissions('update:scholarship_officers')
  @ApiOperation({ summary: 'Lock a Scholarship Officer by upbCode' })
  lockScholarshipOfficer(
    @Param('upbCode') upbCode: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const { id: administrative_id } = request.user;
    return this.administrativesService.lock(+upbCode, administrative_id);
  }

  @Get('tracks/:semesterId')
  @Permissions('view:works')
  @ApiOperation({ summary: 'Obtain Tracking Info Works' })
  getTrackingInfo(
    @Param('semesterId', ParseIntPipe) semesterId: number,
    @Query() tracksSummaryDto: TrackSummaryDto,
  ) {
    return this.administrativesService.getWorkSummary(
      tracksSummaryDto,
      semesterId,
    );
  }

  @Get('departments')
  @Permissions('view:scholarship_officers')
  @ApiOperation({ summary: 'List all Departments' })
  findAllDepartments() {
    return this.administrativesService.findAllDepartments();
  }
}
