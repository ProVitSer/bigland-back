import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LogService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AsteriskAmiEventProviderInterface, AsteriskBlindTransferEvent,  AsteriskDialBeginEvent, AsteriskHungupEvent,  AsteriskUnionEvent } from './types/interfaces';
import { HangupEventParser } from './ami/hangup-event-parser';
import { AsteriskEventType } from './types/types';
import { BlindTransferEventParser } from './ami/blind-transfer-event-parser';
import { DialBeginEventParser } from './ami/dial-begin-event-parser';

export interface PlainObject { [key: string]: any }


@Injectable()
export class AmiService implements OnApplicationBootstrap {
    private client: any;
    

    constructor(
        @Inject('AMI') private readonly ami : any,
        private readonly configService: ConfigService,
        private readonly log: LogService,
        private readonly hangupEvent: HangupEventParser,
        private readonly blindTransfer: BlindTransferEventParser,
        private readonly dialBegin: DialBeginEventParser
    ) {
    }

    get providers(): any {
        return {
            [AsteriskEventType.HangupEvent]: this.hangupEvent,
            [AsteriskEventType.BlindTransferEvent]: this.blindTransfer,
            [AsteriskEventType.DialBeginEvent]: this.dialBegin,
        }
    }

    public async onApplicationBootstrap() {
        try {
            this.client = await this.ami;
            this.client.logLevel = this.configService.get('asterisk.ami.logLevel');
            this.client.open();
            this.client.on('namiConnected', () => this.log.info('Подключение к AMI успешно установлено'));
            this.client.on('namiConnectionClose', () => this.connectionClose());
            this.client.on('namiLoginIncorrect', () => this.loginIncorrect());
            this.client.on('namiInvalidPeer', () => this.invalidPeer());
            this.client.on('namiEventHangup', (event: AsteriskHungupEvent) => this.namiEvent(event, AsteriskEventType.HangupEvent));
            this.client.on('namiEventBlindTransfer', (event: AsteriskBlindTransferEvent) => this.namiEvent(event, AsteriskEventType.BlindTransferEvent));
            this.client.on('namiEventDialBegin', (event: AsteriskDialBeginEvent) => this.namiEvent(event, AsteriskEventType.DialBeginEvent));
        } catch (e) {
            this.log.error(`AMI onApplicationBootstrap ${e}`)
        }

    };

    private namiEvent(event: AsteriskUnionEvent, eventType: AsteriskEventType){
        try {
            const provider = this.getProvider(eventType);
            return provider.parseEvent(event)
        }catch(e){
            this.log.error(e)
        }
    }

    private getProvider(eventType: AsteriskEventType): AsteriskAmiEventProviderInterface {
        return this.providers[eventType];
    }

    public async amiClientSend<T>(action : any): Promise<T> {
        return await new Promise((resolve) =>{
            this.client.send(action, (event: any) => {
                this.log.info(event);
                resolve(event);
            });
        })
    }

    private connectionClose() {
        this.log.error(`Переподключение к AMI ...`);
        setTimeout(() => {
            this.client.open();
        }, 5000);
    }

    private loginIncorrect() {
        this.log.error(`Некорректный логин или пароль от AMI`);
       // process.exit();
    }

    private invalidPeer() {
        this.log.error(`Invalid AMI Salute. Not an AMI?`);
       // process.exit();
        
    }
 
    
}
