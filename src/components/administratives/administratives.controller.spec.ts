import { Test, TestingModule } from '@nestjs/testing';
import { AdministrativesController } from './administratives.controller';
import { AdministrativesService } from './administratives.service';

describe('AdministrativesController', () => {
  let controller: AdministrativesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdministrativesController],
      providers: [AdministrativesService],
    }).compile();

    controller = module.get<AdministrativesController>(AdministrativesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
