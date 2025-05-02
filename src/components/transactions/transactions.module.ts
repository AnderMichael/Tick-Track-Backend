import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SemestersRepository } from '../semesters/semesters.repository';
import { SemestersService } from '../semesters/semesters.service';
import { WorksModule } from '../works/works.module';
import { WorksRepository } from '../works/works.repository';
import { WorksService } from '../works/works.service';
import { TransactionsController } from './transactions.controller';
import { TransactionsRepository } from './transactions.repository';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [AuthModule, WorksModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository, WorksService, WorksRepository, SemestersService, SemestersRepository],
})
export class TransactionsModule { }
