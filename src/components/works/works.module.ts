import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SemestersModule } from '../semesters/semesters.module';
import { SemestersRepository } from '../semesters/semesters.repository';
import { SemestersService } from '../semesters/semesters.service';
import { WorksController } from './works.controller';
import { WorksRepository } from './works.repository';
import { WorksService } from './works.service';

@Module({
  imports: [AuthModule, SemestersModule],
  controllers: [WorksController],
  providers: [WorksService, WorksRepository, SemestersService, SemestersRepository],
})
export class WorksModule { }
