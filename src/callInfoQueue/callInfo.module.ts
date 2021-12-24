import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { CallInfoConsumer } from './callInfo.consumer' 
import { CallInfoService } from './callInfo.service';


@Module({
  imports:[
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
  providers: [CallInfoService, CallInfoConsumer],
  exports:[CallInfoService]
})
export class CallInfoQueueModule {}
