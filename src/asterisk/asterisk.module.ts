import { Module } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { LoggerModule } from '../logger/logger.module'
import { AriService } from './asterisk-ari.service'
import { AmiService } from './asterisk-ami.service';
import * as ARI from 'ari-client';
import * as namiLib from 'nami';
import { DatabaseModule } from '@app/database/database.module';
import { CallInfoQueueModule } from '../callInfoQueue/callInfo.module';
import { AmocrmModule } from '@app/amocrm/amocrm.module';
import { MongoModule } from '@app/mongo/mongo.module';
import { HangupEventParser } from './ami/hangup-event-parser';
import { DialBeginEventParser } from './ami/dial-begin-event-parser';
import { BlindTransferEventParser } from './ami/blind-transfer-event-parser';
import { ActionService } from './ami/action-service';

@Module({
    imports: [
        ConfigModule,
        LoggerModule,
        MongoModule,
        CallInfoQueueModule,
        AmocrmModule
    ],
    providers: [
        {
            provide: 'ARI',
            useFactory: async (configService: ConfigService) => {
                return {
                    ariClient: await ARI.connect(
                        configService.get('asterisk.ari.url'), 
                        configService.get('asterisk.ari.user'), 
                        configService.get('asterisk.ari.password')),
                };
            },
            inject: [ConfigService]
        },
        {
            provide: 'AMI',
            useFactory: async (configService: ConfigService) => {
                return new namiLib.Nami({
                    username: configService.get('asterisk.ami.username'),
                    secret: configService.get('asterisk.ami.password'),
                    host: configService.get('asterisk.ami.host'),
                    port: configService.get('asterisk.ami.port')
                })

            },
            inject: [ConfigService]
        },
        AriService, AmiService, HangupEventParser, DialBeginEventParser, BlindTransferEventParser, ActionService
    ],
    exports: ['ARI', AriService, 'AMI', AmiService, HangupEventParser, DialBeginEventParser, BlindTransferEventParser, ActionService ]
})

export class AsteriskModule {}
