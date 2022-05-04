import { Test, TestingModule } from '@nestjs/testing';
import { GsmGatewayService } from './gsm-gateway.service';

describe('GsmGatewayService', () => {
  let service: GsmGatewayService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GsmGatewayService],
    }).compile();

    service = module.get<GsmGatewayService>(GsmGatewayService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
