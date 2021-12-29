import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CallInfoProcessor } from './callInfo.processor' 
import { CallInfoService } from './callInfo.service';
import { DatabaseModule } from '@app/database/database.module';
import { LoggerModule } from '@app/logger/logger.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { UtilsModule } from '@app/utils/utils.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';


@Module({
  imports:[
    DatabaseModule,
    LoggerModule,
    MongoModule,
    UtilsModule,
    AmocrmModule,
    BullModule.forRootAsync({
    imports: [ConfigModule],
    useFactory: (configService: ConfigService) => ({
      redis: {
        host: configService.get('redis.host'),
        port: configService.get('redis.port'),
        password: configService.get('redis.password'),
      }
    }),
    inject: [ConfigService],
  }),
  BullModule.registerQueue({
    name: 'callInfo'
  }),],
  providers: [CallInfoService, CallInfoProcessor],
  exports:[CallInfoService]
})
export class CallInfoQueueModule {}
