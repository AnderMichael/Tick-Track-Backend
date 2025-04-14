import { Module } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AdministrativesController } from './administratives.controller';
import { AdministrativesService } from './administratives.service';

@Module({
  controllers: [AdministrativesController],
  providers: [UsersService, AdministrativesService],
  imports: []

})
export class AdministrativesModule { }
