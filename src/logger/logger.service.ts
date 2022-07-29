import { TGService } from '@app/telegram/telegram.service';
import {Inject, Injectable, LoggerService, LogLevel} from '@nestjs/common';
import * as winston from 'winston';
import * as Transport from 'winston-transport';
import 'winston-daily-rotate-file';
import { createLogger } from 'winston';
const { combine, timestamp, label, printf, splat } = winston.format;

@Injectable()
export class LogService  {
    constructor(
        @Inject('winston') private readonly logger: winston.Logger,
        private readonly tg: TGService,

    ) {}

    info(message: any, context?: any): void {
        this.logger.info(message, { context });
    }

    debug(message: string, context?: any): void {
        this.logger.debug(message, { context });
    }

    error(message: string, context?: any): void {
        this.logger.error(message, { context });
        this.tg.tgAlert(message);
    }
}

@Injectable()
export class CustomLoggerService  implements LoggerService{
    private customLogger: winston.Logger;

    constructor() {
        this.customLogger = createLogger(this.getLoggetInstance())
    }
    log(message: any, ...optionalParams: any[]) {
        throw new Error('Method not implemented.');
    }
    error(message: any, ...optionalParams: any[]) {
        throw new Error('Method not implemented.');
    }
    warn(message: any, ...optionalParams: any[]) {
        throw new Error('Method not implemented.');
    }
    debug?(message: any, ...optionalParams: any[]) {
        throw new Error('Method not implemented.');
    }
    verbose?(message: any, ...optionalParams: any[]) {
        throw new Error('Method not implemented.');
    }
    setLogLevels?(levels: LogLevel[]) {
        throw new Error('Method not implemented.');
    }

    getLoggetInstance(){
        const transport = new winston.transports.DailyRotateFile({
            dirname: `./api-log//%DATE%`,
            level: 'info',
            filename: `amocrm.log`,
            datePattern: "YYYY-MM-DD",
            handleExceptions: true,
            json: true,
            zippedArchive: true,
            maxSize: "20m",
            maxFiles: "14d"
        })

        return {
            format: combine(timestamp(), splat(), printf(({ level, message, timestamp }) => {
                return `[${level}] - ${timestamp} ${JSON.stringify(message)}`;
            })),
            transport,
        };
    }

    amocrm(message: any, context?: any): void {
        this.customLogger.info(message, {context})
    }
}