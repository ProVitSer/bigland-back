import { LoggerService } from '@app/logger/logger.service';
import { UtilsService } from '@app/utils/utils.service';
import { Inject, Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v4 as uuid } from 'uuid';
import * as namiLib from 'nami';

export interface sendSMSInfo {
    mobileNumber: string;
    smsText: string;
}

@Injectable()
export class GsmGatewayService implements OnApplicationBootstrap {
    private gmsClient: any;

    constructor(
        @Inject('GSM') private readonly gsm: any,
        private readonly configService: ConfigService,
        private readonly log: LoggerService,
    ) {
    }


    public async onApplicationBootstrap() {
        try {
            this.gmsClient = await this.gsm;
            this.gmsClient.open();
            this.gmsClient.on('namiConnected', () => this.log.info('Подключение к GSM шлюзу успешно установлено'));
            this.gmsClient.on('namiConnectionClose', () => this.connectionClose());
            this.gmsClient.on('namiLoginIncorrect', () => this.loginIncorrect());
        } catch (e) {
            this.log.error(`GSM onApplicationBootstrap ${e}`)
        }

    };

    public async sendSms(data: sendSMSInfo): Promise<any>{
        const gsmPort = this.getGSMSendPort();
        const smsInfo = {
            ...data,
            gsmPort
        }
        return await this.gatewaySendSms(smsInfo)
    }

    private async gatewaySendSms({gsmPort, mobileNumber, smsText}): Promise<any> {
        const action = new namiLib.Actions.Smscommand();
        let sms = `gsm send sms ${gsmPort} ${mobileNumber} ${smsText} ${uuid()}`
        action.command = sms;

        return await new Promise((resolve) => {
            this.gmsClient.send(action, (result: any) => {
                console.log(result)
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
