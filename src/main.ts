import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import configuration from '@app/config/config.provider';
import httpsConfig from './https.provider';
import { WsAdapter } from '@nestjs/platform-ws';
import {  HttpException, HttpStatus, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';


async function bootstrap() {
  const config = new ConfigService(configuration());
  const httpsOptions = httpsConfig(config);
  const app = await NestFactory.create(AppModule, {...(httpsOptions ? { httpsOptions } : {})});
  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(new ValidationPipe({
    exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.map((error: ValidationError) => {
            return {
              error: `Поле ${error.property} имеет некорректно значение ${error.value}.`,
              message: Object.values(error.constraints).join(''),
            }
        })
        return new HttpException(messages, HttpStatus.BAD_REQUEST);
         
    }
  }));
  app.setGlobalPrefix('api/v2') 
  await app.listen(config.get('appPort'));
}
bootstrap();
