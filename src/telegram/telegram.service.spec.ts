import { Test, TestingModule } from '@nestjs/testing';
import { TGService } from './telegram.service';

describe('TGService', () => {
  let service: TGService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TGService],
    }).compile();

    service = module.get<TGService>(TGService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
