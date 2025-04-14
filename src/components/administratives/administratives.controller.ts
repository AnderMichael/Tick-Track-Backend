import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdministrativesService } from './administratives.service';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';

@Controller('administratives')
export class AdministrativesController {
  constructor(private readonly administrativesService: AdministrativesService) {}

  @Post()
  create(@Body() createAdministrativeDto: CreateAdministrativeDto) {
    return this.administrativesService.create(createAdministrativeDto);
  }

  @Get()
  findAll() {
    return this.administrativesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.administrativesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAdministrativeDto: UpdateAdministrativeDto) {
    return this.administrativesService.update(+id, updateAdministrativeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.administrativesService.remove(+id);
  }
}
