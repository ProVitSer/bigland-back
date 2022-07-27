
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LogService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import * as Ari from 'ari-client';
import * as moment from 'moment';
import { AsteriskARIStasisStartEvent } from './types/interfaces';
import { AmocrmService } from '@app/amocrm/amocrm.service';
import { operatorCIDNumber } from '@app/config/config';
import { Client } from 'ari-client';

export interface PlainObject { [key: string]: any }

@Injectable()
export class AriService implements OnApplicationBootstrap {
    private callInfo: PlainObject;
    private client: any;

    constructor(
        @Inject('ARI') private readonly ari: Client, 
        private readonly configService: ConfigService,
        private readonly log: LogService,
        private readonly amocrm: AmocrmService
    ) {
    }

    public async onApplicationBootstrap() {
        this.client = this.ari;
        this.client.ariClient.on('StasisStart', async (stasisStartEvent: AsteriskARIStasisStartEvent, dialed: Ari.Channel) => {
            try {
                this.log.info(`Событие входящего вызова ${JSON.stringify(stasisStartEvent)}`);
                const timestamp = moment().format('YYYY-MM-DDTHH:mm:ss');
                await this.checkInAmo(stasisStartEvent);
                return this.continueDialplan(stasisStartEvent.channel.id)
            }catch(e){
                this.log.info("ARI", e)
            }

        });
        this.client.ariClient.start(this.configService.get('asterisk.ari.application') );

    };

    private async checkInAmo(event: AsteriskARIStasisStartEvent): Promise<void>{
        try {
            const incomingTrunk = event.channel.dialplan.exten as operatorCIDNumber;
            return await this.amocrm.actionsInAmocrm(event.channel.caller.number, incomingTrunk);
        }catch(e){
            this.log.info("ARI routingCall", e)
        }

    }

    private async continueDialplan(channelId: string): Promise<void> {
        try {
            return await new Promise((resolve) =>{
                this.client.ariClient.channels.continueInDialplan({ channelId: channelId }, (event: any) => {
                    this.log.info(`ARI continueDialplan ${channelId}`)
                    resolve(event)
                })
            })
        } catch(e){
            this.log.info("ARI continueDialplan error", e)
        }

    }


}