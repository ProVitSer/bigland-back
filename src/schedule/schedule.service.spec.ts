import { Test, TestingModule } from '@nestjs/testing';
import { SyncLDSScheduleService } from './syncLdsSchedule.service';

describe('SyncLDSScheduleService', () => {
  let service: SyncLDSScheduleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SyncLDSScheduleService],
    }).compile();

    service = module.get<SyncLDSScheduleService>(SyncLDSScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
