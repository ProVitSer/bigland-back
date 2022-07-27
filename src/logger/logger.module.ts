import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {  CustomLoggerService, LogService } from './logger.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import 'winston-daily-rotate-file';
const { combine, timestamp, label, printf, splat } = winston.format;
import * as moment from 'moment';
import { TGModule } from '@app/telegram/telegram.module';

@Module({
    imports: [
        TGModule,
        WinstonModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: (configService: ConfigService) => {
                const levels = ['info']
                const transports: Transport[] = [];
                levels.map((level: string) => {
                    transports.push(
                        new winston.transports.DailyRotateFile({
                            dirname: `${configService.get('log.path')}/%DATE%`,
                            level: level,
                            filename: `${level}.log`,
                            datePattern: `${configService.get('log.formatDate')}`,
                            handleExceptions: true,
                            json: true,
                            zippedArchive: true,
                            maxSize: `${configService.get('log.maxSize')}`,
                            maxFiles: `${configService.get('log.maxFiles')}`
                        })
                    )
                });
                return {
                    format: combine(timestamp(), splat(), printf(({ level, message, timestamp }) => {
                        return `[${level}] - ${timestamp} ${JSON.stringify(message)}`;
                    })),
                    transports,
                };
            },
            inject: [ConfigService],
        }),
    ],
    providers: [LogService, CustomLoggerService],
    exports: [LogService, CustomLoggerService],
})
export class LoggerModule { }