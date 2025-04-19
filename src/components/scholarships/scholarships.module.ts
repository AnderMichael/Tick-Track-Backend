import { Module } from '@nestjs/common';
import { ScholarshipsController } from './scholarships.controller';
import { ScholarshipsService } from './scholarships.service';
import { ScholarshipsRepository } from './scholarships.repository';

@Module({
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService, ScholarshipsRepository],
})
export class ScholarshipsModule {}
