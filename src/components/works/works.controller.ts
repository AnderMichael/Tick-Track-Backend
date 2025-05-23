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
import { CreateWorkDto } from './dto/create-work.dto';
import { UpdateWorkDto } from './dto/update-work.dto';
import { WorkPaginationDto } from './dto/work.pagination.dto';
import { WorksService } from './works.service';

@ApiTags('Works')
@Controller('works')
@UseGuards(JwtAuthGuard, UserAvailableGuard, PermissionsGuard)
export class WorksController {
  constructor(private readonly worksService: WorksService) { }

  @Post()
  @Permissions('create:works')
  @ApiOperation({ summary: 'Create new work' })
  create(@Body() createDto: CreateWorkDto, @Req() request: AuthenticatedRequest) {
    return this.worksService.create(createDto, request.user.upbCode);
  }

  @Get()
  @Permissions('view:works')
  @ApiOperation({ summary: 'List works with pagination' })
  findAll(@Query() pagination: WorkPaginationDto) {
    return this.worksService.findAll(pagination);
  }

  @Get(':id')
  @Permissions('view:works')
  @ApiOperation({ summary: 'Get one work by ID' })
  findOne(@Param('id') id: string) {
    return this.worksService.findOne(+id);
  }

  @Patch(':id')
  @Permissions('update:works')
  @ApiOperation({ summary: 'Update a work by ID' })
  update(@Param('id') id: string, @Body() updateDto: UpdateWorkDto) {
    return this.worksService.update(+id, updateDto);
  }

  @Delete(':id')
  @Permissions('delete:works')
  @ApiOperation({ summary: 'Soft delete a work by ID' })
  remove(@Param('id') id: string) {
    return this.worksService.remove(+id);
  }
}
