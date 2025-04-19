import { Module } from '@nestjs/common';
import { WorksController } from './works.controller';
import { WorksRepository } from './works.repository';
import { WorksService } from './works.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [WorksController],
  providers: [WorksService, WorksRepository],
})
export class WorksModule { }
