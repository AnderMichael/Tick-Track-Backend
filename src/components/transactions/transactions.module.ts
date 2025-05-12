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
import { SemestersModule } from '../semesters/semesters.module';
import { StudentsModule } from '../students/students.module';
import { StudentsService } from '../students/students.service';
import { StudentsRepository } from '../students/students.repository';

@Module({
  imports: [AuthModule, WorksModule, SemestersModule, StudentsModule],
  controllers: [TransactionsController],
  providers: [
    TransactionsService,
    TransactionsRepository,
    WorksService,
    WorksRepository,
    SemestersService,
    SemestersRepository,
    StudentsService,
    StudentsRepository
  ],
})
export class TransactionsModule {}
