import { Module } from '@nestjs/common';
import { SemestersController } from './semesters.controller';
import { SemestersRepository } from './semesters.repository';
import { SemestersService } from './semesters.service';

@Module({
    controllers: [SemestersController],
    providers: [SemestersService, SemestersRepository],
})
export class SemestersModule { }