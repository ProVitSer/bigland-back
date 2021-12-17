import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AmocrmModule } from './amocrm/amocrm.module';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from './logger/logger.module';
import configuration from './config/config.provider';

@Module({
  imports: [ConfigModule.forRoot({ load: [configuration] }),AmocrmModule, LoggerModule],
  controllers: [AppController],
  providers: [AppService],
  exports: [ConfigModule]
})
export class AppModule {}
