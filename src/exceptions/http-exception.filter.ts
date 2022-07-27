import { CustomLoggerService, LogService } from '@app/logger/logger.service';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, Injectable, UnauthorizedException, NotFoundException, HttpStatus } from '@nestjs/common';
import { Console } from 'console';
import { Request, Response } from 'express';
import { IHttpResponse } from './types/interfaces';


@Injectable()
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
    constructor(
        private readonly log: LogService,
        ) {
      }

    catch(exception: HttpException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const status = exception.getStatus();
        const responseBody = exception.getResponse()

        this.log.info(responseBody,request);
        const jsonResponse: IHttpResponse = {
            status: status,
            message: responseBody,
            timestamp: new Date().toISOString(),
            createdBy: 'VoIPAPI',
            
        }
        response.status(status).json(jsonResponse);
    }
}