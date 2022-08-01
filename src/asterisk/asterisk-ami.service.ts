import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LogService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import { AsteriskAmiEventProviderInterface, AsteriskBlindTransferEvent,  AsteriskDialBeginEvent, AsteriskDNDStatusResponse, AsteriskHungupEvent, AsteriskStatusResponse, AsteriskUnionEvent, dndStatusMap, EventsStatus, hintStatusMap } from './types/interfaces';
import * as namiLib from 'nami';
import { IDnd } from '@app/api/types/interfaces';
import { AmocrmService } from '@app/amocrm/amocrm.service';
import { MongoService } from '@app/mongo/mongo.service';
import { CollectionType, DbRequestType } from '@app/mongo/types/types';
import { HangupEventParser } from './ami/hangup-event-parser';
import { AsteriskEventType, statusHint } from './types/types';
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

    get amiClient(): any {
        return this.client;
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

    public async sendAmiCall(localExtension: string, outgoingNumber: string): Promise<void> {
        this.log.info(`Исходящий вызов из webhook CRM: внутренний номер ${localExtension} внешний номер ${outgoingNumber}`);
        const action = new namiLib.Actions.Originate();
        action.channel = `PJSIP/${localExtension}`; 
        action.callerid = localExtension;
        action.priority = '1';
        action.timeout = '50000';
        action.context = 'from-internal';
        action.exten = outgoingNumber;
        action.async = 'yes';
        const resultInitCall : any = await new Promise((resolve) =>{
            this.client.send(action, (event: any) => {
                this.log.info(event);
                resolve(event);
            });
        });
        this.log.info(`Результат инициации вызова ${resultInitCall}`);

    }


    public async setDNDStatus(data: IDnd): Promise<any>  {
        const extensionStatusList = {};

        await Promise.all(data.sip_id.map( async (sip_id: string) => {

            const checkExtension = await this.getDNDStatus(sip_id);
            if (checkExtension.response === 'Error'){
                extensionStatusList[sip_id] = {status: 'error'}
                return;
            }


            const action = new namiLib.Actions.DbPut();
            action.Family = 'DND';
            action.Key = sip_id;
            action.Val = dndStatusMap[data.dnd_status];
            const resultSend: AsteriskStatusResponse = await new Promise((resolve) => {
                this.client.send(action, (event: any) => {
                    resolve(event)
                });
            });
            this.log.info(resultSend);

            const hint = hintStatusMap[data.dnd_status]

            if(resultSend.response == 'Success'){
                extensionStatusList[sip_id] = {status: 'success'}

                return this.setHintStatus(sip_id, hint)
            } else {
                return;
            }
        }))

        return extensionStatusList;
    }

    public async getCallStatus(): Promise<AsteriskStatusResponse>{
        const action = new namiLib.Actions.Status();
        let callInfo: AsteriskStatusResponse = await new Promise((resolve) =>{
            this.client.send(action, (event: any) => {
                resolve(event);
            });
        });
        return this.deleteNoUserProp(callInfo) as AsteriskStatusResponse
    }

    private deleteNoUserProp(callInfo: AsteriskStatusResponse): any {
        try{
            return callInfo.events.map( (event: EventsStatus) => {
                delete event.lines;
                delete event.EOL;
                delete event.variables;
                return event
            })
        } catch(e){
            this.log.error(e)
            return callInfo;
        }

    }

    private async getDNDStatus(extension: string): Promise<AsteriskDNDStatusResponse> {
        const action = new namiLib.Actions.DbGet();
        action.Family = 'DND';
        action.Key = extension;
        return await new Promise((resolve) =>{
            this.client.send(action, (event: any) => {
                this.log.info(event);
                resolve(event);
            });
        });
    }

    private async setHintStatus(extension: string, hint: statusHint): Promise<void>  {
        const action = new namiLib.Actions.Command();
        action.Command = `devstate change Custom:DND${extension} ${hint}`;
        return await new Promise((resolve) => {
            this.client.send(action)
            resolve();
        });
        
    }

    private connectionClose() {
        this.log.error(`Переподключение к AMI ...`);
        setTimeout(() => {
            this.client.open();
        }, 5000);
    }

    private loginIncorrect() {
        this.log.error(`Некорректный логин или пароль от AMI`);
        process.exit();
    }

    private invalidPeer() {
        this.log.error(`Invalid AMI Salute. Not an AMI?`);
        process.exit();
        
    }
 
    
}
