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
import { AdministrativesService } from './administratives.service';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';
import { AdministrativePaginationDto } from '../common/dto/user.pagination.dto';

@Controller('administratives')
export class AdministrativesController {
  constructor(private readonly administrativesService: AdministrativesService) { }

  @Post()
  create(@Body() dto: CreateAdministrativeDto) {
    return this.administrativesService.create(dto);
  }

  @Get()
  findAll(@Query() pagination: AdministrativePaginationDto) {
    return this.administrativesService.findAll(pagination);
  }

  @Get(':upbCode')
  findOne(@Param('upbCode', ParseIntPipe) upbCode: number) {
    return this.administrativesService.findOne(upbCode);
  }

  @Patch(':upbCode')
  update(
    @Param('upbCode', ParseIntPipe) upbCode: number,
    @Body() dto: UpdateAdministrativeDto,
  ) {
    return this.administrativesService.update(upbCode, dto);
  }

  @Delete(':upbCode')
  remove(@Param('upbCode', ParseIntPipe) upbCode: number) {
    return this.administrativesService.remove(upbCode);
  }
}
