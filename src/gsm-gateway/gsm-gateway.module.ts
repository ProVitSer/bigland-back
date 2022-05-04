import { Module } from '@nestjs/common';
import { GsmGatewayService } from './gsm-gateway.service';
import * as namiLib from 'nami';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@app/logger/logger.module';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
  ],
  providers: [
    {
      provide: 'AMI',
      useFactory: async (configService: ConfigService) => {
          return new namiLib.Nami({
              username: configService.get('gsmGateway.username'),
              secret: configService.get('gsmGateway.password'),
              host: configService.get('gsmGateway.host'),
              port: configService.get('gsmGateway.port')
          })

      },
      inject: [ConfigService]
    },
    GsmGatewayService],
  exports: ['GSM', GsmGatewayService]
})
export class GsmGatewayModule {}
