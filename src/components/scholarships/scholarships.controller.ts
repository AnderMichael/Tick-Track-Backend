import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Permissions } from '../auth/guards/decorators/permissions.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { UserAvailableGuard } from '../auth/guards/user-availability.guard';
import { PaginationDto } from '../common/dto/pagination.dto';
import { CreateScholarshipDto } from './dto/create-scholarship.dto';
import { CreateServiceDetailsDto } from './dto/create-service-details.dto';
import { UpdateScholarshipDto } from './dto/update-scholarship.dto';
import { UpdateServiceDetailsDto } from './dto/update-service-details.dto';
import { ScholarshipsService } from './scholarships.service';

@ApiTags('Scholarships')
@Controller('scholarships')
@UseGuards(JwtAuthGuard, UserAvailableGuard, PermissionsGuard)
export class ScholarshipsController {
  constructor(private readonly scholarshipsService: ScholarshipsService) {}

  @Post()
  @Permissions('create:scholarships')
  @ApiOperation({ summary: 'Create new scholarship' })
  create(@Body() createDto: CreateScholarshipDto) {
    return this.scholarshipsService.create(createDto);
  }

  @Get()
  @Permissions('view:scholarships')
  @ApiOperation({ summary: 'List scholarships with pagination' })
  findAll(@Query() pagination: PaginationDto) {
    return this.scholarshipsService.findAll(pagination);
  }

  @Get(':id')
  @Permissions('view:scholarships')
  @ApiOperation({ summary: 'Get one scholarship by ID' })
  findOne(@Param('id') id: string) {
    return this.scholarshipsService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('update:scholarships')
  @ApiOperation({ summary: 'Update a scholarship by ID' })
  update(@Param('id') id: string, @Body() updateDto: UpdateScholarshipDto) {
    return this.scholarshipsService.update(+id, updateDto);
  }

  @Delete(':id')
  @Permissions('delete:scholarships')
  @ApiOperation({ summary: 'Soft delete a scholarship by ID' })
  remove(@Param('id') id: string) {
    return this.scholarshipsService.remove(+id);
  }

  @Post(':id/service-details')
  @Permissions('create:scholarships')
  @ApiOperation({ summary: 'Create service details for a scholarship' })
  createServiceDetails(
    @Param('id') id: string,
    @Body() serviceDetails: CreateServiceDetailsDto,
  ) {
    return this.scholarshipsService.createServiceDetails(+id, serviceDetails);
  }

  @Get(':id/service-details')
  @Permissions('view:scholarships')
  @ApiOperation({ summary: 'List service details for a scholarship' })
  findAllServiceDetails(@Param('id') id: string) {
    return this.scholarshipsService.findAllServiceDetails(+id);
  }

  @Get(':id/service-details/:detailId')
  @Permissions('view:scholarships')
  @ApiOperation({ summary: 'Get service details by ID for a scholarship' })
  findServiceDetailsById(
    @Param('id') id: string,
    @Param('detailId') detailId: string,
  ) {
    return this.scholarshipsService.findServiceDetails(+detailId);
  }

  @Patch(':id/service-details/:detailId')
  @Permissions('update:scholarships')
  @ApiOperation({ summary: 'Update service details by ID for a scholarship' })
  updateServiceDetails(
    @Param('id') id: string,
    @Param('detailId') detailId: string,
    @Body() serviceDetails: UpdateServiceDetailsDto,
  ) {
    return this.scholarshipsService.updateServiceDetails(
      +id,
      +detailId,
      serviceDetails,
    );
  }

  @Delete(':id/service-details/:detailId')
  @Permissions('delete:scholarships')
  @ApiOperation({
    summary: 'Soft delete service details by ID for a scholarship',
  })
  removeServiceDetails(
    @Param('id') id: string,
    @Param('detailId') detailId: string,
  ) {
    return this.scholarshipsService.removeServiceDetails(+detailId);
  }
}
