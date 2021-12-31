import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AmocrmModule } from './amocrm/amocrm.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import { AsteriskModule } from './asterisk/asterisk.module';
import configuration from './config/config.provider';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from './database/database.module';
import { UtilsModule } from './utils/utils.module';
import { AxiosModule } from './axios/axios.module';
import { CallInfoQueueModule } from './callInfoQueue/callInfo.module';
import { MongoModule } from './mongo/mongo.module';
import { ScheduleDataModule } from './schedule/schedule.module';
import { TGModule } from './telegram/telegram.module';
import { SocketModule } from './socket/socket.module';


@Module({
  imports: [
  ConfigModule.forRoot({ load: [configuration] }),
  AmocrmModule, 
  LoggerModule, 
  AsteriskModule, 
  DatabaseModule, 
  UtilsModule, 
  AxiosModule, CallInfoQueueModule, MongoModule, ScheduleDataModule, TGModule, SocketModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule]
})
export class AppModule {}
