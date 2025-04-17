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

@Controller('administratives')
export class AdministrativesController {
  constructor(private readonly service: AdministrativesService) { }

  @Post()
  create(@Body() dto: CreateAdministrativeDto) {
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
    @Body() dto: UpdateAdministrativeDto,
  ) {
    return this.service.update(upbCode, dto);
  }

  @Delete(':upbCode')
  remove(@Param('upbCode', ParseIntPipe) upbCode: number) {
    return this.service.remove(upbCode);
  }
}
