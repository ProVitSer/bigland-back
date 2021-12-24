import { forwardRef, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { HttpModule } from "@nestjs/axios";
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from "../logger/logger.module";
import { AxiosService } from './axios.service';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    HttpModule.registerAsync({
        imports: [ConfigModule],
        useFactory: async (configService: ConfigService) => ({
            headers: {
                'User-Agent': 'Backend/1.0.2',
                'Content-Type': 'application/json',
            },
        }),
        inject: [ConfigService],
    })
  ],
  providers: [AxiosService],
  exports: [AxiosService],
})
export class AxiosModule {}
