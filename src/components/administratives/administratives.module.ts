import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AdministrativesController } from './administratives.controller';
import { AdministrativeRepository } from './administratives.repository';
import { AdministrativesService } from './administratives.service';

@Module({
  imports: [AuthModule],
  controllers: [AdministrativesController],
  providers: [AdministrativesService, AdministrativeRepository],
})
export class AdministrativesModule { }
