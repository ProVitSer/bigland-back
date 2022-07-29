import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { AmocrmConnector } from './amocrm.connect';
import * as AmoCRM from 'amocrm-js';
import { LoggerModule } from '@app/logger/logger.module';
import { AmocrmService } from './amocrm.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    HttpModule.registerAsync({
      useFactory: () => ({
        timeout: 5000,
        maxRedirects: 5,
        validateStatus: () => true
      }),
    })
  ],
  providers: [
    {
      provide: 'Amocrm',
      useFactory: (configService: ConfigService) => {
          return  new AmoCRM({
            domain: configService.get('amocrm.domain'),
            auth: {
                client_id: configService.get('amocrm.clientId'),
                client_secret: configService.get('amocrm.clientSecret'),
                redirect_uri: configService.get('amocrm.redirectUri'),
                server: {
                    port: configService.get('amocrm.port'),
                }
            },
        })
      },
      inject: [ConfigService]
  },
  AmocrmConnector,
  AmocrmService],
  exports: [AmocrmService],

})
export class AmocrmModule {}
