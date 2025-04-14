import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { CreateAdministrativeDto } from './dto/create-administrative.dto';
import { UpdateAdministrativeDto } from './dto/update-administrative.dto';

@Injectable()
export class AdministrativesService {
  private readonly usersService: UsersService;
  constructor(usersService: UsersService) {
    this.usersService = usersService;
  }

  create(createAdministrativeDto: CreateAdministrativeDto) {
    return 'This action adds a new administrative';
  }

  findAll() {
    return `This action returns all administratives`;
  }

  findOne(id: number) {
    return `This action returns a #${id} administrative`;
  }

  update(id: number, updateAdministrativeDto: UpdateAdministrativeDto) {
    return `This action updates a #${id} administrative`;
  }

  remove(id: number) {
    return `This action removes a #${id} administrative`;
  }
}
