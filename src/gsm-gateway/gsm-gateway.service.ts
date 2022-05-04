import { LoggerService } from '@app/logger/logger.service';
import { UtilsService } from '@app/utils/utils.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as namiLib from 'nami';
import { timeStamp } from 'console';

export interface sendSMSInfo {
    mobileNumber: string;
    smsText: string;
}

export interface UpdateSMSEvent {
    EOL: string;
    variables: string;
    event: string;
    privilege: string;
    id: string;
    smsc: string;
    status: SendSmsStatus
}

export enum SendSmsStatus {
    successful = 1,
    failure = 0,
}

export enum SmsSendStatusDescription {
    successful = "successful",
    failure = "failure",
    waiting = "waiting",
}

export const SmsSendStatusMap: { [code in SendSmsStatus]?: SmsSendStatusDescription } = {
    [SendSmsStatus.successful]: SmsSendStatusDescription.successful,
    [SendSmsStatus.failure]: SmsSendStatusDescription.failure,
};

@Injectable()
export class GsmGatewayService implements OnApplicationBootstrap {
    private gmsClient: any;
    public smsStatus: any = {};

    constructor(
        @Inject('GSM') private readonly gsm: any,
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
    ) {
    }


    public async onApplicationBootstrap() {
        try {
            this.gmsClient = await this.gsm;
            this.gmsClient.logLevel = 5
            this.gmsClient.open();
            this.gmsClient.on('namiConnected', () => this.log.info('Подключение к GSM шлюзу успешно установлено'));
            this.gmsClient.on('namiConnectionClose', () => this.connectionClose());
            this.gmsClient.on('namiLoginIncorrect', () => this.loginIncorrect());
            this.gmsClient.on('namiEventUpdateSMSSend', (event: UpdateSMSEvent) => this.parseEvent(event));
        } catch (e) {
            this.log.error(`GSM onApplicationBootstrap ${e}`)
        }

    };

    private parseEvent(event: UpdateSMSEvent){
        this.log.info(event)
        this.smsStatus[event.id].statusSend = SmsSendStatusMap[event.status];
    }

    public async sendSms(data: sendSMSInfo): Promise<any>{
        const gsmPort = this.getGSMSendPort();
        const uuid = UtilsService.generateId()
        const smsInfo = {
            mobileNumber: (data.mobileNumber.length == 12)? `8${data.mobileNumber.slice(2,12)}` : `8${data.mobileNumber.slice(1,11)}`,
            smsText: data.smsText,
            gsmPort,
            id: uuid
        }
        this.log.info(smsInfo)

        await this.gatewaySendSms(smsInfo);
        await UtilsService.sleep(10000)
        return this.smsStatus[uuid]
    }

    private async gatewaySendSms({gsmPort, mobileNumber, smsText, id}): Promise<any> {
        const action = new namiLib.Actions.Smscommand();
        let sms = `gsm send sms ${gsmPort} ${mobileNumber} "${smsText}" ${id}`
        action.command = sms;

        return await new Promise((resolve) => {
            this.gmsClient.send(action, (result: any) => {
                this.smsStatus[id] = { mobileNumber, gsmPort, smsText, statusSend: SmsSendStatusDescription.waiting }
                resolve(result)
            })
        }
        );
    }

    private getGSMSendPort(): string {
        const gsmPorts = this.configService.get("gsmGateway.gatewayPorts")
        return UtilsService.randomIntFromArray(gsmPorts)
    }

    private connectionClose() {
        this.log.error(`Переподключение к GSM ...`);
        setTimeout(() => {
            this.gmsClient.open();
        }, 5000);
    }

    private loginIncorrect() {
        this.log.error(`Некорректный логин или пароль от GSM`);
        process.exit();
    }
}
