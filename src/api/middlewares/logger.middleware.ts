import { Request, Response, NextFunction } from "express";
import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { LoggerService } from "@app/logger/logger.service";


@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private requestErrorMessage = null;
  private readonly requestStart = Date.now();

  constructor(
    private readonly log: LoggerService
  ){}

  use(request: Request, response: Response, next: NextFunction): void {

    request.on("error", (error) => {
        this.getError(error);
    });
    response.on("error", (error) => {
        this.getError(error);
    });
    response.on("finish", () => {
        this.logMiddleware(request, response, this.requestErrorMessage);
    });

    next();
  }

  private getError(error: any){
    this.requestErrorMessage = error.message;
  }



  private logMiddleware(request: Request, response: Response, errorMessage: string){
    const { rawHeaders, httpVersion, method, socket, url } = request;
    const { remoteAddress, remoteFamily } = socket;  
    const { statusCode, statusMessage } = response;
    this.log.info(JSON.stringify({
        timestamp: Date.now(),
        processingTime: Date.now() - this.requestStart,
        body: request.body,
        errorMessage,
        httpVersion,
        method,
        remoteAddress,
        remoteFamily,
        url,
        response: {
          statusCode,
          statusMessage,
        }
      }))
  }

}