import { AsteriskModule } from '@app/asterisk/asterisk.module';
import { AuthModule } from '@app/auth/auth.module';
import { LoggerModule } from '@app/logger/logger.module';
import { MiddlewareConsumer, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiController } from './api.controller';
import { LoggerMiddleware } from './middlewares/logger.middleware';

@Module({
  imports:[ConfigModule, LoggerModule, AsteriskModule, AuthModule],
  controllers: [ApiController]
})

export class ApiModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer
        .apply(LoggerMiddleware)
        .forRoutes(ApiController);
  }
}
