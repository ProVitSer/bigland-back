import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AuthModule } from '@app/auth/auth.module';
import { LoggerModule } from '@app/logger/logger.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api.controller';
import { LoggerMiddleware } from './middlewares/logger.middleware';
import { ApiService } from './api.service';
import { GsmGatewayModule } from '@app/gsm-gateway/gsm-gateway.module';

@Module({
  imports:[ConfigModule, LoggerModule, AsteriskModule, AuthModule, GsmGatewayModule],
  controllers: [ApiController],
  providers: [ApiService]
})

export class ApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
        .apply(LoggerMiddleware)
        .forRoutes(ApiController);
  }
}
