import { Module } from '@nestjs/common';
import { AdministrativesController } from './administratives.controller';
import { AdministrativeRepository } from './administratives.repository';
import { AdministrativesService } from './administratives.service';

@Module({
  controllers: [AdministrativesController],
  providers: [AdministrativesService, AdministrativeRepository],
  exports: [],
})
export class AdministrativesModule { }
