import { Module } from '@nestjs/common';
import { SyncLDSScheduleService } from './syncLdsSchedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerModule } from '@app/logger/logger.module';
import { ConfigModule } from '@nestjs/config';
import { AxiosModule } from '@app/axios/axios.module';
import { MongoModule } from '@app/mongo/mongo.module';

@Module({
  imports: [ScheduleModule.forRoot(),LoggerModule, ConfigModule, AxiosModule, MongoModule],
  providers: [SyncLDSScheduleService]
})
export class ScheduleDataModule {}
