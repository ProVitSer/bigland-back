
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import * as Ari from 'ari-client';
import * as moment from 'moment';
import { AsteriskARIStasisStartEvent } from './types/interfaces';

export interface PlainObject { [key: string]: any }

@Injectable()
export class AriService implements OnApplicationBootstrap {
    private callInfo: PlainObject;
    private client: any;

    constructor(
        @Inject('ARI') private readonly ari: any, 
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
    ) {
    }

    public async onApplicationBootstrap() {
        this.client = await this.ari;
        this.client.ariClient.once('StasisStart', async (stasisStartEvent: AsteriskARIStasisStartEvent, dialed: Ari.Channel) => {
            this.log.info(`Событие входящего вызова ${stasisStartEvent}`);
            const timestamp = moment().format('YYYY-MM-DDTHH:mm:ss');
            this.routingCall(stasisStartEvent);
        });
        this.client.ariClient.start(this.configService.get('asterisk.ari.application') );
    };

    private routingCall(event: AsteriskARIStasisStartEvent){
        const incomingNumber = (event.channel.caller.number.length == 10) ? `+7${event.channel.caller.number}`: event.channel.caller.number;
        const incomingTrunk = event.channel.dialplan.exten;
        //Создание лида в амо
        this.continueDialplan(event.channel.id)
    }

    private continueDialplan(channelId: string){
        this.client.channels.continueInDialplan({ channelId: channelId })
    }


}