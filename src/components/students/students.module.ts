import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { SemestersModule } from '../semesters/semesters.module';
import { SemestersRepository } from '../semesters/semesters.repository';
import { SemestersService } from '../semesters/semesters.service';
import { StudentsController } from './students.controller';
import { StudentsRepository } from './students.repository';
import { StudentsService } from './students.service';
import { TransactionsRepository } from '../transactions/transactions.repository';

@Module({
  imports: [AuthModule, SemestersModule],
  controllers: [StudentsController],
  providers: [StudentsService, StudentsRepository, SemestersService, SemestersRepository, TransactionsRepository],
  exports: [StudentsService, StudentsRepository],
})
export class StudentsModule { }
