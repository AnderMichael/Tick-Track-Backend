import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  controllers: [StudentsController],
  providers: [UsersService, StudentsService],
  imports: []
})
export class StudentsModule { }
