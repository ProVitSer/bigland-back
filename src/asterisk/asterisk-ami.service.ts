import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { AsteriskCause, AsteriskDNDStatusResponse, AsteriskExtensionStatusEvent, AsteriskHungupEvent, AsteriskStatusResponse, CallType, dndStatusMap, EventsStatus, hintStatusMap, statusDND, statusHint } from './types/interfaces';
import { CallInfoService } from '@app/callInfoQueue/callInfo.service';
import * as namiLib from 'nami';
import * as util from 'util';
import { DNDDto } from '@app/api/dto/dnd.dto';

export interface PlainObject { [key: string]: any }
let checkCDR = true;


@Injectable()
export class AmiService implements OnApplicationBootstrap {
    private client: any;
    

    constructor(
        @Inject('AMI') private readonly ami: any,
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
        private callQueue: CallInfoService
        
    ) {
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
            this.client.on('namiEventHangup', (event: AsteriskHungupEvent) => this.parseAmiEvent(event));
            //this.client.on('namiEventExtensionStatus', (event: AsteriskExtensionStatusEvent) => this.changeExtensionStatus(event));
        } catch (e) {
            this.log.error(`AMI onApplicationBootstrap ${e}`)
        }

    };

    private async parseAmiEvent(event: AsteriskHungupEvent): Promise<void>{
        this.log.info(event)
        if(checkCDR && event.calleridnum.toString().length < 4 &&
        event.uniqueid == event.linkedid &&
        event.connectedlinenum.toString().length > 4 &&
        [AsteriskCause.NORMAL_CLEARING, AsteriskCause.USER_BUSY].includes(event?.cause))
        {
            checkCDR = false;
            setTimeout(this.changeValueCDR,1000);
            this.log.info(`Исходящий ${event.uniqueid}`);
            await this.callQueue.runCallQueueJob('Outgoing',{ uniqueid: event.uniqueid, type: CallType.Outgoing});

        } 
        else if(checkCDR && event.calleridnum.toString().length < 4 &&
        event.connectedlinenum.toString().length > 4 &&
        event.cause == AsteriskCause.NORMAL_CLEARING
        ){
            checkCDR = false;
            setTimeout(this.changeValueCDR,1000);
            this.log.info(`Входящий ${event.linkedid}`);
            await this.callQueue.runCallQueueJob('Incoming',{ uniqueid: event.linkedid, type: CallType.Incoming});
        }
        else if(checkCDR && event.calleridnum.toString().length > 4 &&
        event.uniqueid == event.linkedid &&
        event.connectedlinenum.toString().length > 4 &&
        [AsteriskCause.NORMAL_CLEARING, AsteriskCause.USER_BUSY].includes(event?.cause))
        {
            checkCDR = false;
            setTimeout(this.changeValueCDR,1000);
            this.log.info(`Исходящий ${event.uniqueid}`);
            await this.callQueue.runCallQueueJob('Outgoing',{ uniqueid: event.uniqueid, type: CallType.Outgoing});

        } 
        else if(checkCDR && event.calleridnum.toString().length > 4 &&
        event.uniqueid == event.linkedid &&
        event.connectedlinenum.toString().length < 4 &&
        event.cause == AsteriskCause.NORMAL_CLEARING
        ){
            checkCDR = false;
            setTimeout(this.changeValueCDR,1000);
            this.log.info(`Входящий ${event.uniqueid}`);
            await this.callQueue.runCallQueueJob('Incoming',{ uniqueid: event.uniqueid, type: CallType.Incoming});
        }
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


    public async setDNDStatus(data: DNDDto): Promise<any>  {
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


    private changeValueCDR(){
        checkCDR = true;

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