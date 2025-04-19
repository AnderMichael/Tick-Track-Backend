import { Module } from '@nestjs/common';
import { ScholarshipsController } from './scholarships.controller';
import { ScholarshipsService } from './scholarships.service';
import { ScholarshipsRepository } from './scholarships.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [ScholarshipsController],
  providers: [ScholarshipsService, ScholarshipsRepository],
})
export class ScholarshipsModule {}
