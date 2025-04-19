// src/components/administratives/administratives.controller.ts
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/guards/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { AdministrativePaginationDto } from '../common/dto/user.pagination.dto';
import { AdministrativesService } from './administratives.service';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';

@ApiTags('Administratives')
@Controller('administratives')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class AdministrativesController {
  constructor(private readonly administrativesService: AdministrativesService) { }

  @Post('scholarship-officers')
  @Permissions('create:scholarship_officers')
  @ApiOperation({ summary: 'Create new Scholarship Officer' })
  createScholarshipOfficer(@Body() createDto: CreateAdministrativeDto) {
    return this.administrativesService.create(createDto);
  }

  @Get('scholarship-officers')
  @Permissions('view:scholarship_officers')
  @ApiOperation({ summary: 'List Scholarship Officers with pagination' })
  findAllScholarshipOfficers(@Query() pagination: AdministrativePaginationDto) {
    return this.administrativesService.findByRole('SCHOLARSHIP_OFFICER', pagination);
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
  ) {
    return this.administrativesService.update(+upbCode, updateDto);
  }

  @Delete('scholarship-officers/:upbCode')
  @Permissions('delete:scholarship_officers')
  @ApiOperation({ summary: 'Delete a Scholarship Officer by upbCode' })
  removeScholarshipOfficer(@Param('upbCode') upbCode: string) {
    return this.administrativesService.remove(+upbCode);
  }

  @Post('supervisors')
  @Permissions('create:supervisors')
  @ApiOperation({ summary: 'Create new Supervisor' })
  createSupervisor(@Body() createDto: CreateAdministrativeDto) {
    return this.administrativesService.create(createDto);
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
  updateSupervisor(@Param('upbCode') upbCode: string, @Body() updateDto: UpdateAdministrativeDto) {
    return this.administrativesService.update(+upbCode, updateDto);
  }

  @Delete('supervisors/:upbCode')
  @Permissions('delete:supervisors')
  @ApiOperation({ summary: 'Delete a Supervisor by upbCode' })
  removeSupervisor(@Param('upbCode') upbCode: string) {
    return this.administrativesService.remove(+upbCode);
  }
}
