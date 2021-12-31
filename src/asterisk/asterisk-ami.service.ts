import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { LoggerService } from '../logger/logger.service';
import { ConfigService } from '@nestjs/config';
import * as moment from 'moment';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OnEvent } from '@nestjs/event-emitter';
import { AsteriskCause, AsteriskExtensionStatusEvent, AsteriskHungupEvent, AsteriskStatusResponse, CallType, EventsStatus, statusDND, statusHint } from './types/interfaces';
import { CallInfoService } from '@app/callInfoQueue/callInfo.service';
import * as namiLib from 'nami';
import * as util from 'util';


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
        action.channel = `SIP/${localExtension}`; 
        action.callerid = localExtension;
        action.priority = '1';
        action.timeout = '50000';
        action.context = 'from-internal';
        action.exten = outgoingNumber;
        action.async = 'yes';
        const resultInitCall = await this.client.send(action);
        this.log.info(`Результат инициации вызова ${resultInitCall}`);

    }

    public async trasferCall(channelId: string, extension: string): Promise<void> {
        this.log.info(`Перевод вызов через панель канала ${channelId} на добавочный ${extension}`);
        const action = new namiLib.Actions.BlindTransfer();
        action.Channel = channelId;
        action.Context = 'from-internal-xfer';
        action.Exten = extension;
        await new Promise((resolve, reject) => {
            this.client.send(action, (event:any)=>{
                this.log.info(`trasferCall ${event}`)
            })
        });
    }

    public async getDNDStatus(extension: string): Promise<void> {
        const action = new namiLib.Actions.DbGet();
        action.Family = 'DND';
        action.Key = extension;

        const resultSend = await new Promise((resolve, reject) => {
            this.client.send(action, (event:any)=>{
                resolve(event)
            })
        });
        console.log(resultSend)
        // (resultSend.events[0].val == '')? 
        //     this.setDNDStatus(extension, statusDND.on,statusHint.on) : 
        //     this.setDNDStatus(extension, statusDND.off,statusHint.off)
    }

    public async setDNDStatus(extension: string, dnd : statusDND, hint: statusHint) {
        const action = new namiLib.Actions.DbPut();
        action.Family = 'DND';
        action.Key = extension;
        action.Val = dnd;
        const resultSend = await this.client.send(action);


        (resultSend.response == 'Success')? this.setHintStatus(extension, hint) : null
    }

    public async setHintStatus(extension: string, hint: statusHint) {
        const action = new namiLib.Actions.Command();
        action.Command = `devstate change Custom:DND${extension} ${hint}`;
        const resultSend = await this.client.send(action);
    }

    public async getExtensionStatus() {
        const action = new namiLib.Actions.Status();
        const resultExtensionStatus: AsteriskStatusResponse = await new Promise((resolve, reject) => {
            this.client.send(action, (event:any)=>{
                resolve(event)
            })
        });
        return this.formatExtenStatus(resultExtensionStatus)
    }

    private formatExtenStatus(status: AsteriskStatusResponse){
        return status.events.map( (event: EventsStatus) => {
            if (event.hasOwnProperty(`lines`) && event.hasOwnProperty(`EOL`) && event.hasOwnProperty(`variables`)) {
                delete event.lines;
                delete event.EOL;
                delete event.variables;
                return event;
            }
        })

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