import { Test, TestingModule } from '@nestjs/testing';
import { AdministrativesService } from './administratives.service';

describe('AdministrativesService', () => {
  let service: AdministrativesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AdministrativesService],
    }).compile();

    service = module.get<AdministrativesService>(AdministrativesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
